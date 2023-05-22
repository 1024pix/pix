import { ForbiddenAccess } from '../errors.js';

const getParticipantsDivision = async function ({ userId, campaignId, campaignRepository, divisionRepository }) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new ForbiddenAccess();
  }
  return divisionRepository.findByCampaignId(campaignId);
};

export { getParticipantsDivision };
