import { NotFoundError } from '../../../shared/domain/errors.js';

export const saveUserRelevanceFeedbackOnRecommendedTraining = async ({
  userId,
  trainingId,
  campaignParticipationId,
  isRelevant,
  userRecommendedTrainingRepository,
}) => {
  const existingUserRecommendedTraining =
    await userRecommendedTrainingRepository.findByCampaignParticipationIdAndTrainingIdAndUserId({
      userId,
      trainingId,
      campaignParticipationId,
    });

  if (!existingUserRecommendedTraining) {
    throw new NotFoundError('UserRecommendedTraining not Found for given parameters');
  }

  return userRecommendedTrainingRepository.save({
    userId,
    trainingId,
    campaignParticipationId,
    isRelevant,
  });
};
