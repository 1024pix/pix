const AssessmentResult = require('../models/AssessmentResult');
const CompetenceMark = require('../models/CompetenceMark');
const Promise = require('bluebird');
const { UNCERTIFIED_LEVEL } = require('../constants');

const {
  AlreadyRatedAssessmentError,
  CertificationComputeError,
  NotFoundError,
  ForbiddenAccess,
} = require('../errors');

module.exports = async function completeAssessment({
  // Parameters
  assessmentId,
  userId,
  updateCertificationCompletionDate = true,
  // Repositories
  answerRepository,
  assessmentRepository,
  assessmentResultRepository,
  certificationCourseRepository,
  challengeRepository,
  competenceRepository,
  competenceMarkRepository,
  courseRepository,
  skillRepository,
  // Services
  scoringService,
}) {
  const assessment = await assessmentRepository.get(assessmentId);

  if (!assessment) {
    throw new NotFoundError();
  }

  if (assessment.userId !== userId) {
    throw new ForbiddenAccess('User is not allowed to complete this assessment.');
  }

  if (assessment.isCompleted()) {
    throw new AlreadyRatedAssessmentError();
  }

  const dependencies = { answerRepository, challengeRepository, competenceRepository, courseRepository, skillRepository };

  assessment.setCompleted();

  let assessmentScore;
  try {
    assessmentScore = await scoringService.calculateAssessmentScore(dependencies, assessment);
    await _saveAssessmentResult({
      assessment,
      assessmentScore,
      updateCertificationCompletionDate,
      assessmentRepository,
      assessmentResultRepository,
      certificationCourseRepository,
      competenceMarkRepository,
    });

    return assessment;
  }
  catch (error) {
    await _saveResultAfterComputingError({
      assessment,
      assessmentId,
      updateCertificationCompletionDate,
      assessmentRepository,
      assessmentResultRepository,
      certificationCourseRepository,
      error,
    });

    return assessment;
  }
};

async function _saveAssessmentResult({
  // Parameters
  assessment,
  assessmentScore,
  updateCertificationCompletionDate,
  // Repositories
  assessmentRepository,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  // Services
}) {
  const assessmentResult = await _createAssessmentResult({ assessment, assessmentScore, assessmentResultRepository });
  await assessmentRepository.completeByAssessmentId(assessment.id);

  await Promise.map(assessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({ ...competenceMark, ...{ assessmentResultId: assessmentResult.id } });
    return competenceMarkRepository.save(competenceMarkDomain);
  });

  return _updateCompletedDateOfCertification(assessment, certificationCourseRepository, updateCertificationCompletionDate);
}

function _createAssessmentResult({ assessment, assessmentScore, assessmentResultRepository }) {
  const assessmentStatus = _getAssessmentStatus(assessment, assessmentScore);
  const assessmentResult = AssessmentResult.BuildStandardAssessmentResult(assessmentScore.level, assessmentScore.nbPix, assessmentStatus, assessment.id);

  return assessmentResultRepository.save(assessmentResult);
}

function _getAssessmentStatus(assessment, assessmentScore) {
  if (assessmentScore.nbPix === 0 && assessment.isCertification()) {
    assessmentScore.level = UNCERTIFIED_LEVEL;
    return AssessmentResult.status.REJECTED;
  } else {
    return AssessmentResult.status.VALIDATED;
  }
}

function _updateCompletedDateOfCertification(assessment, certificationCourseRepository, updateCertificationCompletionDate) {
  if (assessment.isCertification() && updateCertificationCompletionDate) {
    return certificationCourseRepository.changeCompletionDate(
      assessment.courseId,
      new Date(),
    );
  } else {
    return Promise.resolve();
  }
}

async function _saveResultAfterComputingError({
  assessment,
  assessmentId,
  updateCertificationCompletionDate,
  assessmentRepository,
  assessmentResultRepository,
  certificationCourseRepository,
  error,
}) {
  if (!(error instanceof CertificationComputeError)) {
    return Promise.reject(error);
  }

  const assessmentResult = AssessmentResult.BuildAlgoErrorResult(error, assessmentId);

  await Promise.all([
    assessmentResultRepository.save(assessmentResult),
    assessmentRepository.completeByAssessmentId(assessmentId),
  ]);

  return _updateCompletedDateOfCertification(assessment, certificationCourseRepository, updateCertificationCompletionDate);
}
