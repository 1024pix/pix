const _ = require('lodash');
const campaignCodeGenerator = require('../services/campaigns/campaign-code-generator');
const campaignValidator = require('../validators/campaign-validator');
const Campaign = require('../models/Campaign');
const { UserNotAuthorizedToCreateCampaignError } = require('../errors');

function _checkCreatorhasMembershipForOrganizationAndUser(userId, organizationId, membershipRepository) {
  return membershipRepository.hasMembershipForOrganizationAndUser(organizationId, userId)
    .then((hasAccess) => {
      if(hasAccess) {
        return Promise.resolve();
      }
      return Promise.reject(new UserNotAuthorizedToCreateCampaignError(`User does not have an access to the organization ${organizationId}`));
    });
}

function _checkOrganizationHasAccessToTargetProfile(targetProfileId, organizationId, organizationService) {
  return organizationService.findAllTargetProfilesAvailableForOrganization(organizationId)
    .then((targetProfiles) => {
      if(_.find(targetProfiles, (targetProfile) => targetProfile.id === targetProfileId)) {
        return Promise.resolve();
      }
      throw new UserNotAuthorizedToCreateCampaignError(`Organization does not have an access to the profile ${targetProfileId}`);
    });
}

module.exports = function createCampaign({ campaign, campaignRepository, membershipRepository, organizationService }) {
  return campaignValidator.validate(campaign)
    .then(() => _checkCreatorhasMembershipForOrganizationAndUser(campaign.creatorId, campaign.organizationId, membershipRepository))
    .then(() => _checkOrganizationHasAccessToTargetProfile(campaign.targetProfileId, campaign.organizationId, organizationService))
    .then(() => campaignCodeGenerator.generate(campaignRepository))
    .then((generatedCampaignCode) => {
      const campaignWithCode = new Campaign(campaign);
      campaignWithCode.code = generatedCampaignCode;
      return campaignWithCode;
    })
    .then(campaignRepository.save);
};
