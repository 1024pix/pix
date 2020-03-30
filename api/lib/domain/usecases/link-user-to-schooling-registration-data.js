const { CampaignCodeError } = require('../../domain/errors');

module.exports = async function linkUserToSchoolingRegistrationData({
  campaignCode,
  user,
  campaignRepository,
  schoolingRegistrationRepository,
  userReconciliationService,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign || !campaign.organizationId) {
    throw new CampaignCodeError();
  }

  const schoolingRegistrationId = await userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser({ organizationId: campaign.organizationId, user, schoolingRegistrationRepository });

  return schoolingRegistrationRepository.associateUserAndSchoolingRegistration({ userId: user.id, schoolingRegistrationId });
};
