import * as prescriberRoleRepository from '../../infrastructure/repositories/prescriber-role-repository.js';
import { CampaignAuthorization } from '../preHandlers/models/CampaignAuthorization.js';

const execute = async function ({ userId, campaignId }) {
  const prescriberRole = await prescriberRoleRepository.getForCampaign({ userId, campaignId });
  return CampaignAuthorization.isAllowedToAccess({ prescriberRole });
};

export { execute };
