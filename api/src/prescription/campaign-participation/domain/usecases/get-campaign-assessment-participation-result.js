import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';

import * as injectedCampaignAssessmentParticipationResultRepository from '../../infrastructure/repositories/campaign-assessment-participation-result-repository.js';
import * as injectedCampaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';

const getCampaignAssessmentParticipationResult = async function ({
  userId,
  campaignId,
  campaignParticipationId,
  campaignRepository = injectedCampaignRepository,
  campaignAssessmentParticipationResultRepository = injectedCampaignAssessmentParticipationResultRepository,
  locale,
} = {}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to the organization that owns the campaign');
  }

  return campaignAssessmentParticipationResultRepository.getByCampaignIdAndCampaignParticipationId({
    campaignId,
    campaignParticipationId,
    locale,
  });
};

export { getCampaignAssessmentParticipationResult };
