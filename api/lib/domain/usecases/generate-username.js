const { CampaignCodeError } = require('../errors');

module.exports = async function generateUsername({
  user,
  campaignCode,
  campaignRepository,
  studentRepository,
  userReconciliationService,
  userRepository,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign || !campaign.organizationId) {
    throw new CampaignCodeError();
  }

  await userReconciliationService.findMatchingOrganizationStudentIdForGivenUser({ organizationId: campaign.organizationId, user, studentRepository });

  return userReconciliationService.createUsernameByUser({ user , userRepository });

};
