module.exports = async function updateCampaign(
  {
    id,
    title,
    customLandingPageText,
    campaignRepository
  }) {

  const campaign = await campaignRepository.get(id);

  if (title) campaign.title = title;
  if (customLandingPageText) campaign.customLandingPageText = customLandingPageText;

  await campaignRepository.update(campaign);

  return campaign;
};
