import * as prescriberRoleRepository from '../../../../lib/infrastructure/repositories/prescriber-role-repository.js';
import { CampaignAuthorization } from '../pre-handlers/CampaignAuthorization.js';

const execute = async function ({ userId, campaignId }) {
  const prescriberRole = await prescriberRoleRepository.getForCampaign({ userId, campaignId });
  return CampaignAuthorization.isAllowedToManage({ prescriberRole });
};

export { execute };
