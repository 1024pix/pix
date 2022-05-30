const {
  CampaignCodeError,
  UserNotAuthorizedToAccessEntityError,
  OrganizationLearnerDisabledError,
} = require('../errors');

module.exports = async function findAssociationBetweenUserAndOrganizationLearner({
  authenticatedUserId,
  requestedUserId,
  campaignCode,
  campaignRepository,
  organizationLearnerRepository,
}) {
  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntityError();
  }

  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign) {
    throw new CampaignCodeError();
  }

  const registration = await organizationLearnerRepository.findOneByUserIdAndOrganizationId({
    userId: authenticatedUserId,
    organizationId: campaign.organizationId,
  });

  if (registration && registration.isDisabled) {
    throw new OrganizationLearnerDisabledError();
  }

  return registration;
};
