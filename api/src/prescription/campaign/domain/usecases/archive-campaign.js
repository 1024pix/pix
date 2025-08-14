import * as injectedCampaignAdministrationRepository from '../../infrastructure/repositories/campaign-administration-repository.js';
const archiveCampaign = async function ({
  campaignId,
  userId,
  campaignAdministrationRepository = injectedCampaignAdministrationRepository,
} = {}) {
  const campaign = await campaignAdministrationRepository.get(campaignId);
  campaign.archive(new Date(), userId);
  await campaignAdministrationRepository.update(campaign);
  return campaign;
};

export { archiveCampaign };
