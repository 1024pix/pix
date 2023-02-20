import { ForbiddenAccess } from '../errors';

export default async function getParticipantsGroup({ userId, campaignId, campaignRepository, groupRepository }) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new ForbiddenAccess();
  }
  return groupRepository.findByCampaignId(campaignId);
}
