const _ = require('lodash');
const campaignCodeGenerator = require('../services/campaigns/campaign-code-generator');
const campaignValidator = require('../validators/campaign-validator');
const Campaign = require('../models/Campaign');
const { UserNotAuthorizedToCreateCampaignError } = require('../errors');

module.exports = async function createCampaign({ campaign, campaignRepository, userRepository, organizationRepository, organizationService }) {
  campaignValidator.validate(campaign);

  await _checkIfUserCanCreateCampaign(campaign, userRepository, organizationRepository, organizationService);

  const generatedCampaignCode = await campaignCodeGenerator.generate(campaignRepository);
  return campaignRepository.create({ ...campaign, code: generatedCampaignCode });
};

async function _checkIfUserCanCreateCampaign(campaign, userRepository, organizationRepository, organizationService) {
  if (!await _hasCreatorAccessToCampaignOrganization(campaign.creatorId, campaign.organizationId, userRepository)) {
    throw new UserNotAuthorizedToCreateCampaignError(`User does not have an access to the organization ${campaign.organizationId}`);
  }

  if (campaign.type === Campaign.types.PROFILES_COLLECTION && !await _canOrganizationCollectProfiles(campaign.organizationId, organizationRepository)) {
    throw new UserNotAuthorizedToCreateCampaignError('Organization can not create campaign with type PROFILES_COLLECTION');
  }
  if (campaign.type === Campaign.types.ASSESSMENT && !await _hasOrganizationAccessToTargetProfile(campaign.targetProfileId, campaign.organizationId, organizationService)) {
    throw new UserNotAuthorizedToCreateCampaignError(`Organization does not have an access to the profile ${campaign.targetProfileId}`);
  }
}

async function _hasCreatorAccessToCampaignOrganization(userId, organizationId, userRepository) {
  const user = await userRepository.getWithMemberships(userId);
  return user.hasAccessToOrganization(organizationId);
}

async function _hasOrganizationAccessToTargetProfile(targetProfileId, organizationId, organizationService) {
  const targetProfiles = await organizationService.findAllTargetProfilesAvailableForOrganization(organizationId);
  return _.find(targetProfiles, (targetProfile) => targetProfile.id === targetProfileId);
}

async function _canOrganizationCollectProfiles(organizationId, organizationRepository) {
  const organization = await organizationRepository.get(organizationId);
  return organization.canCollectProfiles;
}
