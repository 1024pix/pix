const { CampaignCodeError, UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function findAssociationBetweenUserAndSchoolingRegistration({
  authenticatedUserId,
  requestedUserId,
  campaignCode,
  campaignRepository,
  schoolingRegistrationRepository,
}) {
  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign || !campaign.organizationId) {
    throw new CampaignCodeError();
  }

  return schoolingRegistrationRepository.findOneByUserIdAndOrganizationId({ userId: authenticatedUserId, organizationId: campaign.organizationId });
};
