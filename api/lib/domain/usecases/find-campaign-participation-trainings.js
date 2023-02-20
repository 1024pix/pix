import { UserNotAuthorizedToFindTrainings } from '../errors';

export default async function findCampaignParticipationTrainings({
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
}
