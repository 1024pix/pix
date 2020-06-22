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

  await assessmentRepository.completeByAssessmentId(assessmentId, domainTransaction);

  return new AssessmentCompleted(
    assessmentId,
    assessment.userId,
    assessment.isForCampaign() ? assessment.campaignParticipation.campaign.targetProfileId : null,
    assessment.isForCampaign() ? assessment.campaignParticipation.id : null,
    assessment.isCertification()
  );
};
