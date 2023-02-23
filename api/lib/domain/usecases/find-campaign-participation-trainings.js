const { UserNotAuthorizedToFindTrainings } = require('../errors.js');

module.exports = async function findCampaignParticipationTrainings({
  userId,
  locale,
  campaignParticipationId,
  campaignParticipationRepository,
  userRecommendedTrainingRepository,
}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

  if (campaignParticipation.userId !== userId) {
    throw new UserNotAuthorizedToFindTrainings();
  }

  return userRecommendedTrainingRepository.findByCampaignParticipationId({ campaignParticipationId, locale });
};
