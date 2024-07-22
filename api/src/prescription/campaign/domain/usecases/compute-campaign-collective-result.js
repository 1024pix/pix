import { CampaignLearningContent } from '../../../../../lib/domain/models/CampaignLearningContent.js';
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

  const learningContent = await learningContentRepository.findByCampaignId(campaignId, locale);
  const campaignLearningContent = new CampaignLearningContent(learningContent);
  return campaignCollectiveResultRepository.getCampaignCollectiveResult(campaignId, campaignLearningContent);
};

export { computeCampaignCollectiveResult };
