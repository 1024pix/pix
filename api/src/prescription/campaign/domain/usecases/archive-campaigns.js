import * as injectedCampaignAdministrationRepository from '../../infrastructure/repositories/campaign-administration-repository.js';
const archiveCampaigns = async function ({
  userId,
  campaignIds,
  campaignAdministrationRepository = injectedCampaignAdministrationRepository,
} = {}) {
  await campaignAdministrationRepository.archiveCampaigns(campaignIds, userId);
};

export { archiveCampaigns };
