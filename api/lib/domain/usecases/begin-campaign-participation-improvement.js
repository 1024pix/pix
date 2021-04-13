const Assessment = require('../models/Assessment');
const {
  AlreadySharedCampaignParticipationError,
  UserNotAuthorizedToAccessEntityError,
} = require('../../domain/errors');

module.exports = async function beginCampaignParticipationImprovement({
  campaignParticipationId,
  userId,
  assessmentRepository,
  campaignParticipationRepository,
}) {
  const campaignParticipation = await campaignParticipationRepository.get({ id: campaignParticipationId, options: {} });
  if (campaignParticipation.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntityError();
  }

  if (campaignParticipation.isShared) {
    throw new AlreadySharedCampaignParticipationError();
  }

  const latestAssessment = await assessmentRepository.getLatestByCampaignParticipationId(campaignParticipation.id);
  if (latestAssessment.isImproving && !latestAssessment.isCompleted()) {
    return null;
  }

  const assessment = Assessment.createImprovingForCampaign({ userId, campaignParticipationId });
  await assessmentRepository.save({ assessment });
};
