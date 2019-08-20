const AssessmentResult = require('../models/AssessmentResult');
const CompetenceMark = require('../models/CompetenceMark');
const Promise = require('bluebird');
const { UNCERTIFIED_LEVEL } = require('../constants');

const {
  AlreadyRatedAssessmentError,
  CertificationComputeError,
  NotFoundError,
} = require('../errors');

module.exports = function createAssessmentResultForCompletedAssessment({
  // Parameters
  assessmentId,
  forceRecomputeResult = false,
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
  let assessment;

  return assessmentRepository.get(assessmentId)
    .then((foundAssessment) => {

      assessment = foundAssessment;

      if (!assessment) {
        throw new NotFoundError();
      }

      if (assessment.isCompleted() && !forceRecomputeResult) {
        throw new AlreadyRatedAssessmentError();
      }

      const dependencies = { answerRepository, challengeRepository, competenceRepository, courseRepository, skillRepository };

      assessment.setCompleted();
      return scoringService.calculateAssessmentScore(dependencies, assessment);
    })
    .then((assessmentScore) => _saveAssessmentResult({
      assessment,
      assessmentScore,
      updateCertificationCompletionDate,
      assessmentRepository,
      assessmentResultRepository,
      certificationCourseRepository,
      competenceMarkRepository,
    }))
    .catch((error) => _saveResultAfterComputingError({
      assessment,
      assessmentId,
      updateCertificationCompletionDate,
      assessmentRepository,
      assessmentResultRepository,
      certificationCourseRepository,
      error,
    }));
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
