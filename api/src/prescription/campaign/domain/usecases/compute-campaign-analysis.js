import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';

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

  const campaignLearningContent = await learningContentRepository.findByCampaignId({ campaignId, locale });
  const tutorials = await tutorialRepository.list({ locale });

  return campaignAnalysisRepository.getCampaignAnalysis(campaignId, campaignLearningContent, tutorials);
};

export { computeCampaignAnalysis };
