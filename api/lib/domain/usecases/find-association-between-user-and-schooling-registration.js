const {
  CampaignCodeError,
  UserNotAuthorizedToAccessEntityError,
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

  return schoolingRegistrationRepository.findOneByUserIdAndOrganizationId({ userId: authenticatedUserId, organizationId: campaign.organizationId });
};
