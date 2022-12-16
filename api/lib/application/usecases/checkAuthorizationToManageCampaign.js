const prescriberRoleRepository = require('../../infrastructure/repositories/prescriber-role-repository');
const CampaignAuthorization = require('../preHandlers/models/CampaignAuthorization');

module.exports = {
  async execute({ userId, campaignId }) {
    const prescriberRole = await prescriberRoleRepository.getForCampaign({ userId, campaignId });
    return CampaignAuthorization.isAllowedToManage({ prescriberRole });
  },
};
