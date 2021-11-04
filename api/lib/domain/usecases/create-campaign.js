const _ = require('lodash');
const campaignCodeGenerator = require('../services/campaigns/campaign-code-generator');
const CampaignForCreation = require('../models/CampaignForCreation');
const Campaign = require('../models/Campaign');
const { UserNotAuthorizedToCreateCampaignError } = require('../errors');

module.exports = async function createCampaign({
  campaign,
  campaignRepository,
  userRepository,
  organizationRepository,
  organizationService,
}) {
  const generatedCampaignCode = await campaignCodeGenerator.generate(campaignRepository);
  const campaignForCreation = new CampaignForCreation({ ...campaign, code: generatedCampaignCode });

  await _checkIfUserCanCreateCampaign(campaignForCreation, userRepository, organizationRepository, organizationService);

  return campaignRepository.create(campaignForCreation);
};

async function _checkIfUserCanCreateCampaign(
  campaignForCreation,
  userRepository,
  organizationRepository,
  organizationService
) {
  if (
    !(await _hasCreatorAccessToCampaignOrganization(
      campaignForCreation.creatorId,
      campaignForCreation.organizationId,
      userRepository
    ))
  ) {
    throw new UserNotAuthorizedToCreateCampaignError(
      `User does not have an access to the organization ${campaignForCreation.organizationId}`
    );
  }

  if (
    campaignForCreation.type === Campaign.types.PROFILES_COLLECTION &&
    !(await _canOrganizationCollectProfiles(campaignForCreation.organizationId, organizationRepository))
  ) {
    throw new UserNotAuthorizedToCreateCampaignError(
      'Organization can not create campaign with type PROFILES_COLLECTION'
    );
  }
  if (
    campaignForCreation.type === Campaign.types.ASSESSMENT &&
    !(await _hasOrganizationAccessToTargetProfile(
      campaignForCreation.targetProfileId,
      campaignForCreation.organizationId,
      organizationService
    ))
  ) {
    throw new UserNotAuthorizedToCreateCampaignError(
      `Organization does not have an access to the profile ${campaignForCreation.targetProfileId}`
    );
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
