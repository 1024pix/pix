import { UserNotAuthorizedToAccessEntityError } from '../errors';
import CampaignLearningContent from '../models/CampaignLearningContent';

export default async function computeCampaignCollectiveResult({
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
}
