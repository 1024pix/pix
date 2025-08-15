import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';
import { CampaignParticipationDeletedError } from '../errors.js';

import * as injectedTutorialRepository from '../../../../devcomp/infrastructure/repositories/tutorial-repository.js';
import * as injectedLearningContentRepository from '../../../shared/infrastructure/repositories/learning-content-repository.js';
import * as injectedCampaignAnalysisRepository from '../../infrastructure/repositories/campaign-analysis-repository.js';
import * as injectedCampaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as injectedCampaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';

const computeCampaignParticipationAnalysis = async function ({
  userId,
  campaignParticipationId,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
  campaignRepository = injectedCampaignRepository,
  campaignAnalysisRepository = injectedCampaignAnalysisRepository,
  learningContentRepository = injectedLearningContentRepository,
  tutorialRepository = injectedTutorialRepository,
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

  const campaignLearningContent = await learningContentRepository.findByCampaignId(campaignId, locale);
  const tutorials = await tutorialRepository.list({ locale });

  return campaignAnalysisRepository.getCampaignParticipationAnalysis(
    campaignId,
    campaignParticipation,
    campaignLearningContent,
    tutorials,
  );
};

export { computeCampaignParticipationAnalysis };
