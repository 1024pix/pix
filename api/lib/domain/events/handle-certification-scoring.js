const AssessmentResult = require('../models/AssessmentResult');
const CertificationScoringCompleted = require('./CertificationScoringCompleted.js');
const CompetenceMark = require('../models/CompetenceMark');
const bluebird = require('bluebird');
const { UNCERTIFIED_LEVEL } = require('../constants');
const {
  CertificationComputeError,
} = require('../errors');

async function  handleCertificationScoring({
  assessmentCompletedEvent,
  domainTransaction,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringCertificationService,
  assessmentRepository,
  badgeAcquisitionRepository,
  certificationPartnerAcquisitionRepository,
}) {
  if (assessmentCompletedEvent.isCertification) {
    return _calculateCertificationScore({ assessmentCompletedEvent, assessmentId: assessmentCompletedEvent.assessmentId, domainTransaction, assessmentResultRepository, certificationCourseRepository, competenceMarkRepository, scoringCertificationService, assessmentRepository, badgeAcquisitionRepository, certificationPartnerAcquisitionRepository, });
  }

  return null;

}

async function _calculateCertificationScore({
  assessmentCompletedEvent,
  assessmentId,
  domainTransaction,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringCertificationService,
  assessmentRepository,
}) {
  const assessment = await assessmentRepository.get(assessmentId);
  try {
    const assessmentScore = await scoringCertificationService.calculateAssessmentScore(assessment);
    await _saveResult({
      assessment,
      assessmentScore,
      domainTransaction,
      assessmentResultRepository,
      certificationCourseRepository,
      competenceMarkRepository,
    });

    return new CertificationScoringCompleted({ userId: assessmentCompletedEvent.userId, isCertification: assessmentCompletedEvent.isCertification, certificationCourseId: assessment.certificationCourseId, percentageCorrectAnswers: assessmentScore.percentageCorrectAnswers });

  }
  catch (error) {
    if (!(error instanceof CertificationComputeError)) {
      throw error;
    }
    await _saveResultAfterCertificationComputeError({
      assessment,
      domainTransaction,
      assessmentResultRepository,
      certificationCourseRepository,
      certificationComputeError: error,
    });
  }
}

async function _saveResult({
  assessment,
  assessmentScore,
  domainTransaction,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
}) {
  const assessmentResult = await _createAssessmentResult({
    assessment,
    assessmentScore,
    assessmentResultRepository,
    domainTransaction
  });

  await bluebird.mapSeries(assessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({ ...competenceMark, ...{ assessmentResultId: assessmentResult.id } });
    return competenceMarkRepository.save(competenceMarkDomain, domainTransaction);
  });

  return certificationCourseRepository.changeCompletionDate(assessment.certificationCourseId, new Date(), domainTransaction);
}

function _createAssessmentResult({ assessment, assessmentScore, assessmentResultRepository, domainTransaction }) {
  const assessmentStatus = _getAssessmentStatus(assessmentScore);
  const assessmentResult = AssessmentResult.BuildStandardAssessmentResult(assessmentScore.level, assessmentScore.nbPix, assessmentStatus, assessment.id);
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
  assessment,
  domainTransaction,
  assessmentResultRepository,
  certificationCourseRepository,
  certificationComputeError,
}) {
  const assessmentResult = AssessmentResult.BuildAlgoErrorResult(certificationComputeError, assessment.id);
  await assessmentResultRepository.save(assessmentResult);
  return certificationCourseRepository.changeCompletionDate(assessment.certificationCourseId, new Date(), domainTransaction);
}

module.exports = handleCertificationScoring;
