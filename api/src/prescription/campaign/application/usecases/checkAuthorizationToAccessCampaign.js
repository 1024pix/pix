import { CampaignAuthorization } from '../../../../shared/application/pre-handlers/CampaignAuthorization.js';
import * as prescriberRoleRepository from '../../../../shared/infrastructure/repositories/prescriber-role-repository.js';

const execute = async function ({ userId, campaignId }) {
  const prescriberRole = await prescriberRoleRepository.getForCampaign({ userId, campaignId });
  return CampaignAuthorization.isAllowedToAccess({ prescriberRole });
};

export { execute };
