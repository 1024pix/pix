const getTutorialSteps = async function ({
  campaignId,
  locale,
  badgeRepository,
  campaignRepository,
  learningContentRepository,
}) {
  const campaign = await campaignRepository.get(campaignId);

  const campaignBadges = await badgeRepository.findByCampaignId(campaignId);

  const learningContent = await learningContentRepository.findByCampaignId(campaignId, locale);
  const campaignCompetences = learningContent?.competences;

  return {
    customLandingPageText: campaign?.customLandingPageText,
    badges: campaignBadges,
    competences: campaignCompetences,
  };
};

export { getTutorialSteps };
