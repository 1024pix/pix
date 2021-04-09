const AssessmentResult = require('../models/AssessmentResult');
const CertificationScoringCompleted = require('./CertificationScoringCompleted.js');
const CompetenceMark = require('../models/CompetenceMark');
const bluebird = require('bluebird');
const {
  CertificationComputeError,
} = require('../errors');
const AssessmentCompleted = require('./AssessmentCompleted');
const { checkEventType } = require('./check-event-type');

const eventType = AssessmentCompleted;
const EMITTER = 'PIX-ALGO';

async function handleCertificationScoring({
  event,
  domainTransaction,
  assessmentResultRepository,
  badgeAcquisitionRepository,
  certificationAssessmentRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringCertificationService,
}) {
  checkEventType(event, eventType);

  if (event.isCertificationType) {
    const certificationAssessment = await certificationAssessmentRepository.get(event.assessmentId);
    return _calculateCertificationScore({
      certificationAssessment,
      domainTransaction,
      assessmentResultRepository,
      certificationCourseRepository,
      competenceMarkRepository,
      scoringCertificationService,
      badgeAcquisitionRepository,
    });
  }

  return null;
}

async function _calculateCertificationScore({
  certificationAssessment,
  domainTransaction,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringCertificationService,
}) {
  try {
    const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore(certificationAssessment);
    await _saveResult({
      certificationAssessmentScore,
      certificationAssessment,
      domainTransaction,
      assessmentResultRepository,
      certificationCourseRepository,
      competenceMarkRepository,
    });
    return new CertificationScoringCompleted({
      userId: certificationAssessment.userId,
      certificationCourseId: certificationAssessment.certificationCourseId,
      reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
      isValidated: certificationAssessmentScore.status === AssessmentResult.status.VALIDATED,
    });
  }
  catch (error) {
    if (!(error instanceof CertificationComputeError)) {
      throw error;
    }
    await _saveResultAfterCertificationComputeError({
      certificationAssessment,
      domainTransaction,
      assessmentResultRepository,
      certificationCourseRepository,
      certificationComputeError: error,
    });
  }
}

async function _saveResult({
  certificationAssessment,
  certificationAssessmentScore,
  domainTransaction,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
}) {
  const assessmentResult = await _createAssessmentResult({
    certificationAssessment,
    certificationAssessmentScore,
    domainTransaction,
    assessmentResultRepository,
  });

  await bluebird.mapSeries(certificationAssessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({ ...competenceMark, ...{ assessmentResultId: assessmentResult.id } });
    return competenceMarkRepository.save(competenceMarkDomain, domainTransaction);
  });

  return certificationCourseRepository.changeCompletionDate(certificationAssessment.certificationCourseId, new Date(), domainTransaction);
}

function _createAssessmentResult({
  certificationAssessment,
  certificationAssessmentScore,
  domainTransaction,
  assessmentResultRepository,
}) {
  const assessmentResult = AssessmentResult.buildStandardAssessmentResult({
    pixScore: certificationAssessmentScore.nbPix,
    status: certificationAssessmentScore.status,
    assessmentId: certificationAssessment.id,
    emitter: EMITTER,
  });
  return assessmentResultRepository.save(assessmentResult, domainTransaction);
}

async function _saveResultAfterCertificationComputeError({
  certificationAssessment,
  domainTransaction,
  assessmentResultRepository,
  certificationCourseRepository,
  certificationComputeError,
}) {
  const assessmentResult = AssessmentResult.buildAlgoErrorResult({
    error: certificationComputeError,
    assessmentId: certificationAssessment.id,
    emitter: EMITTER,
  });
  await assessmentResultRepository.save(assessmentResult, domainTransaction);
  return certificationCourseRepository.changeCompletionDate(certificationAssessment.certificationCourseId, new Date(), domainTransaction);
}
handleCertificationScoring.eventType = eventType;
module.exports = handleCertificationScoring;
