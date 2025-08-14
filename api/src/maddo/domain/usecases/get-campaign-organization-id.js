import * as injectedCampaignRepository from '../../infrastructure/repositories/campaign-repository.js';
export async function getCampaignOrganizationId({ campaignId, campaignRepository = injectedCampaignRepository } = {}) {
  return campaignRepository.getOrganizationId(campaignId);
}
