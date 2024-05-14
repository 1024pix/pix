import { ForbiddenAccess } from '../../../../shared/domain/errors.js';

const getParticipantsGroup = async function ({ userId, campaignId, campaignRepository, groupRepository }) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new ForbiddenAccess();
  }
  return groupRepository.findByCampaignId(campaignId);
};

export { getParticipantsGroup };
