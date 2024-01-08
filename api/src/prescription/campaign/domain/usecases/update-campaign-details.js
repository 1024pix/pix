import { EntityValidationError } from '../../../../shared/domain/errors.js';

const updateCampaignDetails = async function ({
  campaignId,
  name,
  title,
  customLandingPageText,
  customResultPageText,
  customResultPageButtonText,
  customResultPageButtonUrl,
  multipleSendings,
  campaignAdministrationRepository,
  campaignManagementRepository,
  campaignUpdateValidator,
}) {
  const campaign = await campaignManagementRepository.get(campaignId);
  campaign.name = name;
  campaign.title = title;
  campaign.customLandingPageText = customLandingPageText;
  campaign.customResultPageText = customResultPageText;
  campaign.customResultPageButtonText = customResultPageButtonText;
  campaign.customResultPageButtonUrl = customResultPageButtonUrl;

  if (multipleSendings !== campaign.multipleSendings && campaign.totalParticipationsCount > 0) {
    throw new EntityValidationError({
      invalidAttributes: [
        { attribute: 'multipleSendings', message: 'CANT_UPDATE_ATTRIBUTE_WHEN_CAMPAIGN_HAS_PARTICIPATIONS' },
      ],
    });
  } else {
    campaign.multipleSendings = multipleSendings;
  }

  campaignUpdateValidator.validate(campaign);

  const campaignAttributes = {
    name,
    title,
    customLandingPageText,
    customResultPageText,
    customResultPageButtonText,
    customResultPageButtonUrl,
    multipleSendings: campaign.multipleSendings,
  };

  return campaignAdministrationRepository.updateByCampaignId({ campaignId, campaignAttributes });
};

export { updateCampaignDetails };
