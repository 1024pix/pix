const { AssessmentStartError } = require('../../domain/errors');

module.exports = async function startAssessmentForPlacement({ assessment, assessmentRepository }) {

  const lastPlacement = await assessmentRepository.getLastPlacementAssessmentByUserIdAndCourseId(assessment.userId, assessment.courseId);

  if(lastPlacement && !lastPlacement.isCompleted()) {
    throw new AssessmentStartError('Une évaluation en cours existe déjà');
  }

  assessment.start();
  return assessmentRepository.save(assessment);
};
