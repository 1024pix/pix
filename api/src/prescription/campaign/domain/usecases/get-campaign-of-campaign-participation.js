import * as injectedCampaignRepository from '../../infrastructure/repositories/campaign-repository.js';
const getCampaignOfCampaignParticipation = async function ({
  campaignParticipationId,
  campaignRepository = injectedCampaignRepository,
} = {}) {
  return campaignRepository.getByCampaignParticipationId(campaignParticipationId);
};

export { getCampaignOfCampaignParticipation };
