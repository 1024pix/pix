const AssessmentResult = require('../models/AssessmentResult');
const CertificationScoringCompleted = require('./CertificationScoringCompleted.js');
const CompetenceMark = require('../models/CompetenceMark');
const bluebird = require('bluebird');
const { UNCERTIFIED_LEVEL } = require('../constants');
const {
  CertificationComputeError,
} = require('../errors');

async function handleCertificationScoring({
  assessmentCompletedEvent,
  domainTransaction,
  assessmentResultRepository,
  badgeAcquisitionRepository,
  certificationAssessmentRepository,
  certificationCourseRepository,
  certificationPartnerAcquisitionRepository,
  competenceMarkRepository,
  scoringCertificationService,
}) {
  if (assessmentCompletedEvent.isCertification) {
    const certificationAssessment = await certificationAssessmentRepository.get(assessmentCompletedEvent.assessmentId);
    return _calculateCertificationScore({ certificationAssessment, domainTransaction, assessmentResultRepository, certificationCourseRepository, competenceMarkRepository, scoringCertificationService, badgeAcquisitionRepository, certificationPartnerAcquisitionRepository });
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
    const assessmentScore = await scoringCertificationService.calculateAssessmentScore(certificationAssessment);
    await _saveResult({
      assessmentScore,
      certificationAssessment,
      domainTransaction,
      assessmentResultRepository,
      certificationCourseRepository,
      competenceMarkRepository,
    });
    return new CertificationScoringCompleted({
      userId: certificationAssessment.userId,
      certificationCourseId: certificationAssessment.certificationCourseId,
      reproducibilityRate: assessmentScore.percentageCorrectAnswers,
      limitDate: certificationAssessment.createdAt,
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
  assessmentScore,
  domainTransaction,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
}) {
  const assessmentResult = await _createAssessmentResult({
    certificationAssessment,
    assessmentScore,
    assessmentResultRepository,
    domainTransaction
  });

  await bluebird.mapSeries(assessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({ ...competenceMark, ...{ assessmentResultId: assessmentResult.id } });
    return competenceMarkRepository.save(competenceMarkDomain, domainTransaction);
  });

  return certificationCourseRepository.changeCompletionDate(certificationAssessment.certificationCourseId, new Date(), domainTransaction);
}

function _createAssessmentResult({ certificationAssessment, assessmentScore, assessmentResultRepository, domainTransaction }) {
  const assessmentStatus = _getAssessmentStatus(assessmentScore);
  const assessmentResult = AssessmentResult.BuildStandardAssessmentResult(assessmentScore.level, assessmentScore.nbPix, assessmentStatus, certificationAssessment.id);
  return assessmentResultRepository.save(assessmentResult, domainTransaction);
}

function _getAssessmentStatus(assessmentScore) {
  if (assessmentScore.nbPix === 0) {
    assessmentScore.level = UNCERTIFIED_LEVEL;
    return AssessmentResult.status.REJECTED;
  } else {
    return AssessmentResult.status.VALIDATED;
  }
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

module.exports = handleCertificationScoring;
