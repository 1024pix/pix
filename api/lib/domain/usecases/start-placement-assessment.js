const { AssessmentStartError } = require('../../domain/errors');

module.exports = async function startPlacementAssessment({ assessment, assessmentRepository }) {

  const lastPlacement = await assessmentRepository.findOneLastPlacementAssessmentByUserIdAndCourseId(assessment.userId, assessment.courseId);

  if (lastPlacement && !lastPlacement.canStartNewAttemptOnCourse()) {
    throw new AssessmentStartError('Impossible de démarrer un nouveau positionnement');
  }

  assessment.start();
  return assessmentRepository.save(assessment);
};
