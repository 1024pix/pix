const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function computeCampaignCollectiveResult(
  {
    userId,
    campaignId,
    campaignRepository,
    campaignCollectiveResultRepository,
    targetProfileWithLearningContentRepository,
  } = {}) {

  const hasUserAccessToResult = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

  if (!hasUserAccessToResult) {
    throw new UserNotAuthorizedToAccessEntity('User does not have access to this campaign');
  }

  const targetProfileWithLearningContent = await targetProfileWithLearningContentRepository.getByCampaignId({ campaignId });
  return campaignCollectiveResultRepository.getCampaignCollectiveResult(campaignId, targetProfileWithLearningContent);
};
