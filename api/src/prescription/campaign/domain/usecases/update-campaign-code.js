import { CampaignCodeFormatError, CampaignUniqueCodeError, UnknownCampaignId } from './../errors.js';

const updateCampaignCode = async function ({
  campaignId,
  campaignCode,
  campaignAdministrationRepository,
  codeGenerator,
}) {
  const campaign = await campaignAdministrationRepository.get(campaignId);
  if (!campaign) {
    throw new UnknownCampaignId();
  }
  if (!codeGenerator.validate(campaignCode)) {
    throw new CampaignCodeFormatError();
  }
  const isCodeAvailable = await campaignAdministrationRepository.isCodeAvailable(campaignCode);
  if (!isCodeAvailable) {
    throw new CampaignUniqueCodeError();
  }
  await campaignAdministrationRepository.update({ campaignId, campaignAttributes: { code: campaignCode } });
};

export { updateCampaignCode };
