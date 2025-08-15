import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';

import * as injectedLearningContentRepository from '../../../shared/infrastructure/repositories/learning-content-repository.js';
import * as injectedCampaignCollectiveResultRepository from '../../infrastructure/repositories/campaign-collective-result-repository.js';
import * as injectedCampaignRepository from '../../infrastructure/repositories/campaign-repository.js';

const computeCampaignCollectiveResult = async function ({
  userId,
  campaignId,
  campaignRepository = injectedCampaignRepository,
  campaignCollectiveResultRepository = injectedCampaignCollectiveResultRepository,
  learningContentRepository = injectedLearningContentRepository,
  locale,
} = {}) {
  const hasUserAccessToResult = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

  if (!hasUserAccessToResult) {
    throw new UserNotAuthorizedToAccessEntityError('User does not have access to this campaign');
  }

  const campaignLearningContent = await learningContentRepository.findByCampaignId(campaignId, locale);
  return campaignCollectiveResultRepository.getCampaignCollectiveResult(campaignId, campaignLearningContent);
};

export { computeCampaignCollectiveResult };
