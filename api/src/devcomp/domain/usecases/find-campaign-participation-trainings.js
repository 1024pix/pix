import { UserNotAuthorizedToFindTrainings } from '../../../../lib/domain/errors.js';

const findCampaignParticipationTrainings = async function ({
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

export { findCampaignParticipationTrainings };
