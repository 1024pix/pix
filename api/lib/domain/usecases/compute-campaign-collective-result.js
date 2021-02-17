const { UserNotAuthorizedToAccessEntityError } = require('../errors');

module.exports = async function computeCampaignCollectiveResult(
  {
    userId,
    campaignId,
    campaignRepository,
    campaignCollectiveResultRepository,
    targetProfileWithLearningContentRepository,
    locale,
  } = {}) {

  const hasUserAccessToResult = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

  if (!hasUserAccessToResult) {
    throw new UserNotAuthorizedToAccessEntityError('User does not have access to this campaign');
  }

  const targetProfileWithLearningContent = await targetProfileWithLearningContentRepository.getByCampaignId({ campaignId, locale });
  return campaignCollectiveResultRepository.getCampaignCollectiveResult(campaignId, targetProfileWithLearningContent);
};
