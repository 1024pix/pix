const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function computeCampaignAnalysis(
  {
    userId,
    campaignId,
    campaignRepository,
    campaignAnalysisRepository,
    targetProfileWithLearningContentRepository,
    tutorialRepository,
  } = {}) {

  const hasUserAccessToResult = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

  if (!hasUserAccessToResult) {
    throw new UserNotAuthorizedToAccessEntity('User does not have access to this campaign');
  }

  const targetProfile = await targetProfileWithLearningContentRepository.getByCampaignId({ campaignId });
  const tutorials = await tutorialRepository.list();

  return campaignAnalysisRepository.getCampaignAnalysis(campaignId, targetProfile, tutorials);
};
