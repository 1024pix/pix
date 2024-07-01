import { CampaignUniqueCodeError, UnknownCampaignId } from './../errors.js';

const updateCampaignCode = async function ({ campaignId, campaignCode, campaignAdministrationRepository }) {
  const campaign = await campaignAdministrationRepository.get(campaignId);
  if (!campaign) {
    throw new UnknownCampaignId();
  }

  campaign.updateFields({ code: campaignCode });

  const isCodeAvailable = await campaignAdministrationRepository.isCodeAvailable({ code: campaignCode });
  if (!isCodeAvailable) {
    throw new CampaignUniqueCodeError();
  }

  await campaignAdministrationRepository.update(campaign);
};

export { updateCampaignCode };
