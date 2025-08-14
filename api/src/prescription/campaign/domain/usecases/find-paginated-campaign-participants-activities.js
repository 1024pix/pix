import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';
import { campaignParticipantActivityRepository as injectedCampaignParticipantActivityRepository } from '../../infrastructure/repositories/campaign-participant-activity-repository.js';
import * as injectedCampaignRepository from '../../infrastructure/repositories/campaign-repository.js';

const findPaginatedCampaignParticipantsActivities = async function ({
  userId,
  campaignId,
  page,
  filters,
  campaignRepository = injectedCampaignRepository,
  campaignParticipantActivityRepository = injectedCampaignParticipantActivityRepository,
} = {}) {
  await _checkUserAccessToCampaign(campaignId, userId, campaignRepository);

  return campaignParticipantActivityRepository.findPaginatedByCampaignId({ page, campaignId, filters });
};

export { findPaginatedCampaignParticipantsActivities };

async function _checkUserAccessToCampaign(campaignId, userId, campaignRepository) {
  const hasAccess = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);
  if (!hasAccess) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to an organization that owns the campaign');
  }
}
