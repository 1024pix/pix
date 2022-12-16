const { ForbiddenAccess } = require('../errors');

module.exports = async function getParticipantsGroup({ userId, campaignId, campaignRepository, groupRepository }) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new ForbiddenAccess();
  }
  return groupRepository.findByCampaignId(campaignId);
};
