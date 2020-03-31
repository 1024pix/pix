const _ = require('lodash');
const campaignCodeGenerator = require('../services/campaigns/campaign-code-generator');
const campaignValidator = require('../validators/campaign-validator');
const Campaign = require('../models/Campaign');
const { UserNotAuthorizedToCreateCampaignError } = require('../errors');

module.exports = async function createCampaign({ campaign, campaignRepository, userRepository, organizationRepository, organizationService }) {
  campaignValidator.validate(campaign);

  await _checkCreatorHasAccessToCampaignOrganization(campaign.creatorId, campaign.organizationId, userRepository);

  if (campaign.isProfilesCollection()) {
    await _checkOrganizationCanCollectProfiles(campaign.organizationId, organizationRepository);
  }
  if (campaign.isAssessment()) {
    await _checkOrganizationHasAccessToTargetProfile(campaign.targetProfileId, campaign.organizationId, organizationService);
  }
  const generatedCampaignCode = await campaignCodeGenerator.generate(campaignRepository);
  const campaignWithCode = new Campaign(campaign);
  campaignWithCode.code = generatedCampaignCode;
  return campaignRepository.save(campaignWithCode);
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

function _checkOrganizationCanCollectProfiles(organizationId, organizationRepository) {
  return organizationRepository.get(organizationId)
    .then((organization) => {
      if (organization.canCollectProfiles) {
        return Promise.resolve();
      }
      throw new UserNotAuthorizedToCreateCampaignError('Organization can not create campaign with type PROFILES_COLLECTION');
    });
}
