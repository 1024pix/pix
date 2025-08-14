import * as injectedCampaignAdministrationRepository from '../../infrastructure/repositories/campaign-administration-repository.js';
import * as injectedCampaignUpdateValidator from '../validators/campaign-update-validator.js';
const updateCampaignDetails = async function ({
  campaignId,
  name,
  title,
  customLandingPageText,
  customResultPageText,
  customResultPageButtonText,
  customResultPageButtonUrl,
  multipleSendings,
  isForAbsoluteNovice,
  isAuthorizedToUpdateIsForAbsoluteNovice,
  campaignAdministrationRepository = injectedCampaignAdministrationRepository,
  campaignUpdateValidator = injectedCampaignUpdateValidator,
} = {}) {
  const campaign = await campaignAdministrationRepository.get(campaignId);

  campaign.updateFields(
    {
      name,
      title,
      customLandingPageText,
      customResultPageText,
      customResultPageButtonText,
      customResultPageButtonUrl,
      multipleSendings,
      isForAbsoluteNovice,
    },
    isAuthorizedToUpdateIsForAbsoluteNovice,
  );
  // TODO : should be called inside model method updateFields
  campaignUpdateValidator.validate(campaign);

  return campaignAdministrationRepository.update(campaign);
};

export { updateCampaignDetails };
