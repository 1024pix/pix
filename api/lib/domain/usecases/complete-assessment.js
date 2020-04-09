const AssessmentCompleted = require('../events/AssessmentCompleted');

const {
  AlreadyRatedAssessmentError,
} = require('../errors');

module.exports = async function completeAssessment({
  assessmentId,
  assessmentRepository,
  domainTransaction
}) {
  const assessment = await assessmentRepository.get(assessmentId);

  if (assessment.isCompleted()) {
    throw new AlreadyRatedAssessmentError();
  }

  await assessmentRepository.completeByAssessmentId(domainTransaction, assessmentId);

  return new AssessmentCompleted(
    assessmentId,
    assessment.userId,
    assessment.isSmartPlacement() ? assessment.campaignParticipation.campaign.targetProfileId : null,
    assessment.isSmartPlacement() ? assessment.campaignParticipation.id : null,
    assessment.isCertification()
  );
};
