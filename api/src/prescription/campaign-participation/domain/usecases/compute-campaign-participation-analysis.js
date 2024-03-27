import { UserNotAuthorizedToAccessEntityError } from '../../../../../lib/domain/errors.js';
import { CampaignLearningContent } from '../../../../../lib/domain/models/CampaignLearningContent.js';
import { CampaignParticipationDeletedError } from '../errors.js';

const computeCampaignParticipationAnalysis = async function ({
  userId,
  campaignParticipationId,
  campaignParticipationRepository,
  campaignRepository,
  campaignAnalysisRepository,
  learningContentRepository,
  tutorialRepository,
  locale,
} = {}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
  const campaignId = campaignParticipation.campaignId;
  const hasUserAccessToResult = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

  if (!hasUserAccessToResult) {
    throw new UserNotAuthorizedToAccessEntityError('User does not have access to this campaign');
  }

  if (campaignParticipation.deletedAt !== null) {
    throw new CampaignParticipationDeletedError('Cannot access deleted campaign participation');
  }

  if (!campaignParticipation.isShared) {
    return null;
  }

  const learningContent = await learningContentRepository.findByCampaignId(campaignId, locale);
  const campaignLearningContent = new CampaignLearningContent(learningContent);
  const tutorials = await tutorialRepository.list({ locale });

  return campaignAnalysisRepository.getCampaignParticipationAnalysis(
    campaignId,
    campaignParticipation,
    campaignLearningContent,
    tutorials,
  );
};

export { computeCampaignParticipationAnalysis };
