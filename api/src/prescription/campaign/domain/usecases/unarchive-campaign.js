import * as injectedCampaignAdministrationRepository from '../../infrastructure/repositories/campaign-administration-repository.js';
const unarchiveCampaign = async function ({
  campaignId,
  campaignAdministrationRepository = injectedCampaignAdministrationRepository,
} = {}) {
  const campaign = await campaignAdministrationRepository.get(campaignId);
  campaign.unarchive();
  await campaignAdministrationRepository.update(campaign);
  return campaign;
};

export { unarchiveCampaign };
