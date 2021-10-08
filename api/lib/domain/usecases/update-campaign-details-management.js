const campaignValidator = require('../validators/campaign-validator');

module.exports = async function updateCampaignDetailsManagement({
  campaignId,
  name,
  title,
  customLandingPageText,
  customResultPageText,
  customResultPageButtonText,
  customResultPageButtonUrl,
  campaignManagementRepository,
}) {
  const campaign = await campaignManagementRepository.get(campaignId);
  campaign.name = name;
  campaign.title = title;
  campaign.customLandingPageText = customLandingPageText;
  campaign.customResultPageText = customResultPageText;
  campaign.customResultPageButtonText = customResultPageButtonText;
  campaign.customResultPageButtonUrl = customResultPageButtonUrl;

  campaignValidator.validate(campaign);
  const campaignAttributes = {
    name,
    title,
    customLandingPageText,
    customResultPageText,
    customResultPageButtonText,
    customResultPageButtonUrl,
  };
  return campaignManagementRepository.update({ campaignId, campaignAttributes });
};
