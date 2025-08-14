import * as injectedCampaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
const getUserCampaignParticipationToCampaign = async function ({
  userId,
  campaignId,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
} = {}) {
  return campaignParticipationRepository.findOneByCampaignIdAndUserId({ campaignId, userId });
};

export { getUserCampaignParticipationToCampaign };
