import { UserNotAuthorizedToAccessEntityError } from '../errors.js';
import { CampaignLearningContent } from '../models/CampaignLearningContent.js';

const computeCampaignAnalysis = async function ({
  userId,
  campaignId,
  campaignRepository,
  campaignAnalysisRepository,
  learningContentRepository,
  tutorialRepository,
  locale,
} = {}) {
  const hasUserAccessToResult = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

  if (!hasUserAccessToResult) {
    throw new UserNotAuthorizedToAccessEntityError('User does not have access to this campaign');
  }

  const learningContent = await learningContentRepository.findByCampaignId(campaignId, locale);
  const campaignLearningContent = new CampaignLearningContent(learningContent);
  const tutorials = await tutorialRepository.list({ locale });

  return campaignAnalysisRepository.getCampaignAnalysis(campaignId, campaignLearningContent, tutorials);
};

export { computeCampaignAnalysis };
