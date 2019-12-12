const { CampaignCodeError, UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function findAssociationBetweenUserAndOrganizationStudent({
  authenticatedUserId,
  requestedUserId,
  campaignCode,
  campaignRepository,
  studentRepository,
}) {
  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign || !campaign.organizationId) {
    throw new CampaignCodeError();
  }

  return studentRepository.findOneByUserIdAndOrganizationId({ userId: authenticatedUserId, organizationId: campaign.organizationId });
};
