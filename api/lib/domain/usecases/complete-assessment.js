const AssessmentResult = require('../models/AssessmentResult');
const CompetenceMark = require('../models/CompetenceMark');
const Promise = require('bluebird');
const { UNCERTIFIED_LEVEL } = require('../constants');

const {
  AlreadyRatedAssessmentError,
  CertificationComputeError,
} = require('../errors');

module.exports = async function completeAssessment({
  assessmentId,
  answerRepository,
  assessmentRepository,
  assessmentResultRepository,
  certificationCourseRepository,
  challengeRepository,
  competenceRepository,
  competenceMarkRepository,
  courseRepository,
  skillRepository,
  scoringCertificationService,
}) {
  const assessment = await assessmentRepository.get(assessmentId);

  if (assessment.isCompleted()) {
    throw new AlreadyRatedAssessmentError();
  }
  assessment.setCompleted();

  if (assessment.isCertification()) {
    await _calculateCertificationScore({ assessment, answerRepository, challengeRepository, competenceRepository, courseRepository, skillRepository,
      assessmentResultRepository, certificationCourseRepository, competenceMarkRepository, scoringCertificationService });
  }
  await assessmentRepository.completeByAssessmentId(assessmentId);
  return assessment;
};

async function _calculateCertificationScore({
  assessment,
  answerRepository,
  challengeRepository,
  competenceRepository,
  courseRepository,
  skillRepository,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringCertificationService,
}) {
  try {
    const dependencies = { answerRepository, challengeRepository, competenceRepository, courseRepository, skillRepository };
    const assessmentScore = await scoringCertificationService.calculateAssessmentScore(dependencies, assessment);
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
  // Parameters
  assessment,
  assessmentScore,
  // Repositories
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  // Services
}) {
  const assessmentResult = await _createAssessmentResult({ assessment, assessmentScore, assessmentResultRepository });

  await Promise.map(assessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({ ...competenceMark, ...{ assessmentResultId: assessmentResult.id } });
    return competenceMarkRepository.save(competenceMarkDomain);
  });

  return certificationCourseRepository.changeCompletionDate(assessment.courseId, new Date());
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

  return certificationCourseRepository.changeCompletionDate(assessment.courseId, new Date());
}
