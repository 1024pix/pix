const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function computeCampaignAnalysis(
  {
    userId,
    campaignId,
    campaignRepository,
    campaignAnalysisRepository,
    targetProfileWithLearningContentRepository,
    tutorialRepository,
    locale,
  } = {}) {

  const hasUserAccessToResult = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

  if (!hasUserAccessToResult) {
    throw new UserNotAuthorizedToAccessEntity('User does not have access to this campaign');
  }

  const targetProfileWithLearningContent = await targetProfileWithLearningContentRepository.getByCampaignId({ campaignId, locale });
  const tutorials = await tutorialRepository.list({ locale });

  return campaignAnalysisRepository.getCampaignAnalysis(campaignId, targetProfileWithLearningContent, tutorials);
};
