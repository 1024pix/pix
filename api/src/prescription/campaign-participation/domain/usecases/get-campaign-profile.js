import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';
import * as injectedCampaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as injectedCampaignProfileRepository from '../../infrastructure/repositories/campaign-profile-repository.js';

const getCampaignProfile = async function ({
  userId,
  campaignId,
  campaignParticipationId,
  campaignRepository = injectedCampaignRepository,
  campaignProfileRepository = injectedCampaignProfileRepository,
  locale,
} = {}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to an organization that owns the campaign');
  }

  return campaignProfileRepository.findProfile({ campaignId, campaignParticipationId, locale });
};

export { getCampaignProfile };
