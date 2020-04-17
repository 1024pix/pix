const userRepository = require('../../infrastructure/repositories/user-repository');
const campaignRepository = require('../../infrastructure/repositories/campaign-repository');
const _ = require('lodash');

module.exports = {

  execute(userId, campaignId) {
    return Promise.all([
      userRepository.getWithMemberships(userId),
      campaignRepository.get(campaignId)
    ]).then(([user, campaign]) => {
      return _.some(user.memberships, { organization: { id : campaign.organizationId } });
    });
  }
};
