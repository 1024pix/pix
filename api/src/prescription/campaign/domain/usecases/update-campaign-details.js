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
  campaignAdministrationRepository,
  campaignUpdateValidator,
}) {
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

  campaignUpdateValidator.validate(campaign);

  const campaignAttributes = {
    name: campaign.name,
    title: campaign.title,
    customLandingPageText: campaign.customLandingPageText,
    customResultPageText: campaign.customResultPageText,
    customResultPageButtonText: campaign.customResultPageButtonText,
    customResultPageButtonUrl: campaign.customResultPageButtonUrl,
    multipleSendings: campaign.multipleSendings,
    isForAbsoluteNovice: campaign.isForAbsoluteNovice,
  };

  return campaignAdministrationRepository.update({ campaignId, campaignAttributes });
};

export { updateCampaignDetails };
