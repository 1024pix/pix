import prescriberRoleRepository from '../../infrastructure/repositories/prescriber-role-repository';
import CampaignAuthorization from '../preHandlers/models/CampaignAuthorization';

export default {
  async execute({ userId, campaignId }) {
    const prescriberRole = await prescriberRoleRepository.getForCampaign({ userId, campaignId });
    return CampaignAuthorization.isAllowedToManage({ prescriberRole });
  },
};
