const { UserNotAuthorizedToFindTrainings } = require('../errors');

module.exports = async function findCampaignParticipationTrainings({
  userId,
  campaignParticipationId,
  locale,
  campaignParticipationRepository,
  campaignRepository,
  trainingRepository,
}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

  if (campaignParticipation.userId !== userId) throw new UserNotAuthorizedToFindTrainings();

  const { targetProfile } = await campaignRepository.get(campaignParticipation.campaign.id);

  if (!targetProfile) {
    return [];
  }

  return trainingRepository.findByTargetProfileIdAndLocale({
    targetProfileId: targetProfile.id,
    locale,
  });
};
