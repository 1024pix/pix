import * as injectedCampaignParticipationRepository from '../../../prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import { UserNotAuthorizedToFindTrainings } from '../errors.js';

const findCampaignParticipationTrainings = async function ({
  userId,
  locale,
  campaignParticipationId,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
  userRecommendedTrainingRepository,
} = {}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

  if (campaignParticipation.userId !== userId) {
    throw new UserNotAuthorizedToFindTrainings();
  }

  return userRecommendedTrainingRepository.findByCampaignParticipationId({ campaignParticipationId, locale });
};

export { findCampaignParticipationTrainings };
