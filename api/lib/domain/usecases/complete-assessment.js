const AssessmentCompleted = require('../events/AssessmentCompleted');

const {
  AlreadyRatedAssessmentError,
} = require('../errors');

module.exports = async function completeAssessment({
  assessmentId,
  assessmentRepository,
}) {
  const assessment = await assessmentRepository.get(assessmentId);

  if (assessment.isCompleted()) {
    throw new AlreadyRatedAssessmentError();
  }

  await assessmentRepository.completeByAssessmentId(assessmentId);

  return new AssessmentCompleted({
    assessmentId: assessment.id,
    userId: assessment.userId,
    campaignParticipationId: assessment.campaignParticipationId,
    certificationCourseId: assessment.certificationCourseId,
  });
};
