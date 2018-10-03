const campaignCodeGenerator = require('../services/campaigns/campaign-code-generator');
const campaignValidator = require('../validators/campaign-validator');
const Campaign = require('../models/Campaign');
const { UserNotAuthorizedToCreateCampaignError } = require('../errors');

function _checkCreatorHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  return userRepository.getWithOrganizationAccesses(userId)
    .then((user) => {
      if(user.hasAccessToOrganization(organizationId)) {
        return Promise.resolve();
      }
      return Promise.reject(new UserNotAuthorizedToCreateCampaignError(`User does not have an access to the organization ${organizationId}`));
    });
}

function _checkOrganizationHasAccessToTargetProfile(targetProfileId, organizationId, targetProfileRepository) {
  return targetProfileRepository.get(targetProfileId)
    .then((targetProfile) => {
      if(targetProfile.isPublic ||
        targetProfile.organizationId == organizationId ||
        targetProfile.organizationsSharedId.includes(organizationId)) {
        return Promise.resolve();
      }
      return Promise.reject(new UserNotAuthorizedToCreateCampaignError(`Organization does not have an access to the profile ${targetProfileId}`));
    });
}

module.exports = function createCampaign({ campaign, campaignRepository, userRepository, targetProfileRepository }) {
  return campaignValidator.validate(campaign)
    .then(() => _checkCreatorHasAccessToCampaignOrganization(campaign.creatorId, campaign.organizationId, userRepository))
    .then(() => _checkOrganizationHasAccessToTargetProfile(campaign.targetProfileId, campaign.organizationId, targetProfileRepository))
    .then(() => campaignCodeGenerator.generate(campaignRepository))
    .then((generatedCampaignCode) => {
      const campaignWithCode = new Campaign(campaign);
      campaignWithCode.code = generatedCampaignCode;
      return campaignWithCode;
    })
    .then(campaignRepository.save);
};
