const { CampaignCodeError } = require('../errors');

module.exports = async function generateUsername({
  user,
  campaignCode,
  campaignRepository,
  schoolingRegistrationRepository,
  userReconciliationService,
  userRepository,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign || !campaign.organizationId) {
    throw new CampaignCodeError(`Le code campagne ${campaignCode} n'existe pas.`);
  }

  await userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser({ organizationId: campaign.organizationId, user, schoolingRegistrationRepository });

  return userReconciliationService.createUsernameByUser({ user , userRepository });

};
