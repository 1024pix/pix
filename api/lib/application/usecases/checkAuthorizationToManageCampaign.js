const prescriberRoleRepository = require('../../infrastructure/repositories/prescriber-role-repository.js');
const CampaignAuthorization = require('../preHandlers/models/CampaignAuthorization.js');

module.exports = {
  async execute({ userId, campaignId }) {
    const prescriberRole = await prescriberRoleRepository.getForCampaign({ userId, campaignId });
    return CampaignAuthorization.isAllowedToManage({ prescriberRole });
  },
};
