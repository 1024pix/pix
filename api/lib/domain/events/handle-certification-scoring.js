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

async function handleCertificationScoring({
  domainTransaction,
  event,
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
    assessmentResultRepository,
    domainTransaction,
  });

  await bluebird.mapSeries(certificationAssessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({ ...competenceMark, ...{ assessmentResultId: assessmentResult.id } });
    return competenceMarkRepository.save(competenceMarkDomain, domainTransaction);
  });

  return certificationCourseRepository.changeCompletionDate(certificationAssessment.certificationCourseId, new Date(), domainTransaction);
}

function _createAssessmentResult({ certificationAssessment, certificationAssessmentScore, assessmentResultRepository, domainTransaction }) {
  const assessmentResult = AssessmentResult.BuildStandardAssessmentResult(certificationAssessmentScore.nbPix, certificationAssessmentScore.status, certificationAssessment.id);
  return assessmentResultRepository.save(assessmentResult, domainTransaction);
}

async function _saveResultAfterCertificationComputeError({
  certificationAssessment,
  domainTransaction,
  assessmentResultRepository,
  certificationCourseRepository,
  certificationComputeError,
}) {
  const assessmentResult = AssessmentResult.BuildAlgoErrorResult(certificationComputeError, certificationAssessment.id);
  await assessmentResultRepository.save(assessmentResult);
  return certificationCourseRepository.changeCompletionDate(certificationAssessment.certificationCourseId, new Date(), domainTransaction);
}
handleCertificationScoring.eventType = eventType;
module.exports = handleCertificationScoring;
