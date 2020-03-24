const AssessmentResult = require('../models/AssessmentResult');
const CompetenceMark = require('../models/CompetenceMark');
const Promise = require('bluebird');
const { UNCERTIFIED_LEVEL } = require('../constants');
const AssessmentCompleted = require('../events/AssessmentCompleted');

const {
  AlreadyRatedAssessmentError,
  CertificationComputeError,
} = require('../errors');

module.exports = async function completeAssessment({
  assessmentId,
  assessmentRepository,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringCertificationService,
  domainTransaction
}) {
  const assessment = await assessmentRepository.get(assessmentId);

  if (assessment.isCompleted()) {
    throw new AlreadyRatedAssessmentError();
  }

  if (assessment.isCertification()) {
    await _calculateCertificationScore({ assessment, assessmentResultRepository, certificationCourseRepository, competenceMarkRepository, scoringCertificationService });
  }
  await assessmentRepository.completeByAssessmentId(domainTransaction, assessmentId);

  return new AssessmentCompleted(
    assessment.userId,
    assessment.isSmartPlacement() ? assessment.targetProfile.id : null,
    assessment.isSmartPlacement() ? assessment.campaignParticipation.id : null,
  );
};

async function _calculateCertificationScore({
  assessment,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringCertificationService,
}) {
  try {
    const assessmentScore = await scoringCertificationService.calculateAssessmentScore(assessment);
    await _saveResult({
      assessment,
      assessmentScore,
      assessmentResultRepository,
      certificationCourseRepository,
      competenceMarkRepository,
    });
  }
  catch (error) {
    if (!(error instanceof CertificationComputeError)) {
      throw error;
    }
    await _saveResultAfterCertificationComputeError({
      assessment,
      assessmentResultRepository,
      certificationCourseRepository,
      certificationComputeError: error,
    });
  }
}

async function _saveResult({
  assessment,
  assessmentScore,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
}) {
  const assessmentResult = await _createAssessmentResult({ assessment, assessmentScore, assessmentResultRepository });

  await Promise.map(assessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({ ...competenceMark, ...{ assessmentResultId: assessmentResult.id } });
    return competenceMarkRepository.save(competenceMarkDomain);
  });

  return certificationCourseRepository.changeCompletionDate(assessment.certificationCourseId, new Date());
}

function _createAssessmentResult({ assessment, assessmentScore, assessmentResultRepository }) {
  const assessmentStatus = _getAssessmentStatus(assessment, assessmentScore);
  const assessmentResult = AssessmentResult.BuildStandardAssessmentResult(assessmentScore.level, assessmentScore.nbPix, assessmentStatus, assessment.id);
  return assessmentResultRepository.save(assessmentResult);
}

function _getAssessmentStatus(assessment, assessmentScore) {
  if (assessmentScore.nbPix === 0) {
    assessmentScore.level = UNCERTIFIED_LEVEL;
    return AssessmentResult.status.REJECTED;
  } else {
    return AssessmentResult.status.VALIDATED;
  }
}

async function _saveResultAfterCertificationComputeError({
  assessment,
  assessmentResultRepository,
  certificationCourseRepository,
  certificationComputeError,
}) {
  const assessmentResult = AssessmentResult.BuildAlgoErrorResult(certificationComputeError, assessment.id);
  await assessmentResultRepository.save(assessmentResult);
  return certificationCourseRepository.changeCompletionDate(assessment.certificationCourseId, new Date());
}
