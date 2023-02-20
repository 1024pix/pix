import campaignValidator from '../validators/campaign-validator';
import { EntityValidationError } from '../errors';

export default async function updateCampaignDetailsManagement({
  campaignId,
  name,
  title,
  customLandingPageText,
  customResultPageText,
  customResultPageButtonText,
  customResultPageButtonUrl,
  multipleSendings,
  campaignManagementRepository,
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

  campaignValidator.validate(campaign);
  const campaignAttributes = {
    name,
    title,
    customLandingPageText,
    customResultPageText,
    customResultPageButtonText,
    customResultPageButtonUrl,
    multipleSendings: campaign.multipleSendings,
  };
  return campaignManagementRepository.update({ campaignId, campaignAttributes });
}
