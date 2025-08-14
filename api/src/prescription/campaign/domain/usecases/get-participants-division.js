import { ForbiddenAccess } from '../../../../shared/domain/errors.js';
import * as injectedCampaignRepository from '../../infrastructure/repositories/campaign-repository.js';
import * as injectedDivisionRepository from '../../infrastructure/repositories/division-repository.js';

const getParticipantsDivision = async function ({
  userId,
  campaignId,
  campaignRepository = injectedCampaignRepository,
  divisionRepository = injectedDivisionRepository,
} = {}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new ForbiddenAccess();
  }
  return divisionRepository.findByCampaignId(campaignId);
};

export { getParticipantsDivision };
