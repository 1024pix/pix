import { ForbiddenAccess } from '../../../../shared/domain/errors.js';
import * as injectedCampaignRepository from '../../infrastructure/repositories/campaign-repository.js';
import * as injectedGroupRepository from '../../infrastructure/repositories/group-repository.js';

const getParticipantsGroup = async function ({
  userId,
  campaignId,
  campaignRepository = injectedCampaignRepository,
  groupRepository = injectedGroupRepository,
} = {}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new ForbiddenAccess();
  }
  return groupRepository.findByCampaignId(campaignId);
};

export { getParticipantsGroup };
