import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';

const computeCampaignCollectiveResult = async function ({
  userId,
  campaignId,
  campaignRepository,
  campaignCollectiveResultRepository,
  learningContentRepository,
  locale,
} = {}) {
  const hasUserAccessToResult = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

  if (!hasUserAccessToResult) {
    throw new UserNotAuthorizedToAccessEntityError('User does not have access to this campaign');
  }

  const campaignLearningContent = await learningContentRepository.findByCampaignId({ campaignId, locale });
  return campaignCollectiveResultRepository.getCampaignCollectiveResult(campaignId, campaignLearningContent);
};

export { computeCampaignCollectiveResult };
