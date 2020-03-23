const _ = require('lodash');
const campaignCodeGenerator = require('../services/campaigns/campaign-code-generator');
const campaignValidator = require('../validators/campaign-validator');
const Campaign = require('../models/Campaign');
const { UserNotAuthorizedToCreateCampaignError } = require('../errors');

module.exports = async function createCampaign({ campaign, campaignRepository, userRepository, organizationService }) {
  campaignValidator.validate(campaign);
  campaign.type = Campaign.types.TEST_GIVEN;
  return _checkCreatorHasAccessToCampaignOrganization(campaign.creatorId, campaign.organizationId, userRepository)
    .then(() => _checkOrganizationHasAccessToTargetProfile(campaign.targetProfileId, campaign.organizationId, organizationService))
    .then(() => campaignCodeGenerator.generate(campaignRepository))
    .then((generatedCampaignCode) => {
      const campaignWithCode = new Campaign(campaign);
      campaignWithCode.code = generatedCampaignCode;
      return campaignWithCode;
    })
    .then(campaignRepository.save);
};

function _checkCreatorHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  return userRepository.getWithMemberships(userId)
    .then((user) => {
      if (user.hasAccessToOrganization(organizationId)) {
        return Promise.resolve();
      }
      return Promise.reject(new UserNotAuthorizedToCreateCampaignError(`User does not have an access to the organization ${organizationId}`));
    });
}

function _checkOrganizationHasAccessToTargetProfile(targetProfileId, organizationId, organizationService) {
  return organizationService.findAllTargetProfilesAvailableForOrganization(organizationId)
    .then((targetProfiles) => {
      if (_.find(targetProfiles, (targetProfile) => targetProfile.id === targetProfileId)) {
        return Promise.resolve();
      }
      throw new UserNotAuthorizedToCreateCampaignError(`Organization does not have an access to the profile ${targetProfileId}`);
    });
}
