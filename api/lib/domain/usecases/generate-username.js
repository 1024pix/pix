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
    throw new CampaignCodeError(`Le code campagne ${campaignCode} n'existe pas.`);
  }

  await userReconciliationService.findMatchingStudentIdForGivenOrganizationIdAndUser({ organizationId: campaign.organizationId, user, studentRepository });

  return userReconciliationService.createUsernameByUser({ user , userRepository });

};
