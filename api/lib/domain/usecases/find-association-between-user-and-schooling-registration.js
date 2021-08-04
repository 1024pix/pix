const {
  CampaignCodeError,
  UserNotAuthorizedToAccessEntityError,
  SchoolingRegistrationDisabledError,
} = require('../errors');

module.exports = async function findAssociationBetweenUserAndSchoolingRegistration({
  authenticatedUserId,
  requestedUserId,
  campaignCode,
  campaignRepository,
  schoolingRegistrationRepository,
}) {
  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntityError();
  }

  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign) {
    throw new CampaignCodeError();
  }

  const registration = await schoolingRegistrationRepository.findOneByUserIdAndOrganizationId({
    userId: authenticatedUserId,
    organizationId: campaign.organizationId,
  });

  if (registration && registration.isDisabled) {
    throw new SchoolingRegistrationDisabledError();
  }

  return registration;
};
