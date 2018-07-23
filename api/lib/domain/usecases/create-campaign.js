const _ = require('lodash');

const campaignCodeGenerator = require('../services/campaigns/campaign-code-generator');
const campaignValidator = require('../validators/campaign-validator');
const Campaign = require('../models/Campaign');
const { UserNotAuthorizedToCreateCampaignError } = require('../errors');

function _checkCreatorHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  if(_.isNil(organizationId)) {
    return Promise.resolve();
  }

  return userRepository.getWithOrganizationsAccesses(userId)
    .then((user) => {
      if(user.hasAccessToOrganization(organizationId)) {
        return Promise.resolve();
      }
      return Promise.reject(new UserNotAuthorizedToCreateCampaignError(`User does not have an access to the organization ${organizationId}`));
    });
}

module.exports = function({ campaign, campaignRepository, userRepository }) {

  return campaignValidator.validate(campaign)
    .then(() => _checkCreatorHasAccessToCampaignOrganization(campaign.creatorId, campaign.organizationId, userRepository))
    .then(() => campaignCodeGenerator.generate(campaignRepository))
    .then((generatedCampaignCode) => {
      const campaignWithCode = new Campaign(campaign);
      campaignWithCode.code = generatedCampaignCode;
      return campaignWithCode;
    })
    .then(campaignRepository.save);
};
