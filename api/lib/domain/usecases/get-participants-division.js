const { ForbiddenAccess } = require('../errors.js');

module.exports = async function getParticipantsDivision({
  userId,
  campaignId,
  campaignRepository,
  divisionRepository,
}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new ForbiddenAccess();
  }
  return divisionRepository.findByCampaignId(campaignId);
};
