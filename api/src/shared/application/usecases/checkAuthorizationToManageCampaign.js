import { CampaignAuthorization } from '../../../../lib/application/preHandlers/models/CampaignAuthorization.js';
import * as prescriberRoleRepository from '../../../../lib/infrastructure/repositories/prescriber-role-repository.js';

const execute = async function ({ userId, campaignId }) {
  const prescriberRole = await prescriberRoleRepository.getForCampaign({ userId, campaignId });
  return CampaignAuthorization.isAllowedToManage({ prescriberRole });
};

export { execute };
