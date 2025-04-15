import * as prescriberRoleRepository from '../../../../lib/infrastructure/repositories/prescriber-role-repository.js';
import { CampaignAuthorization } from '../../../../src/shared/application/pre-handlers/CampaignAuthorization.js';

const execute = async function ({ userId, campaignId }) {
  const prescriberRole = await prescriberRoleRepository.getForCampaign({ userId, campaignId });
  return CampaignAuthorization.isAllowedToAccess({ prescriberRole });
};

export { execute };
