import { UserNotAuthorizedToFindTrainings } from '../errors.js';
import { UserRecommendedTraining } from '../read-models/UserRecommendedTraining.js';

const findCampaignParticipationTrainings = async function ({
  userId,
  locale,
  campaignParticipationId,
  campaignParticipationRepository,
  userRecommendedTrainingRepository,
  campaignFeatureRepository,
}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

  if (campaignParticipation.userId !== userId) {
    throw new UserNotAuthorizedToFindTrainings();
  }

  const [trainings, highlightedTrainingIds] = await Promise.all([
    userRecommendedTrainingRepository.findByCampaignParticipationId({ campaignParticipationId, locale }),
    campaignFeatureRepository.getHighlightedTrainingsForCampaign({ campaignId: campaignParticipation.campaignId }),
  ]);

  return trainings.map(
    (training) =>
      new UserRecommendedTraining({ ...training, isHighlighted: highlightedTrainingIds.includes(training.id) }),
  );
};

export { findCampaignParticipationTrainings };
