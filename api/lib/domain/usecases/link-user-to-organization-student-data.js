const { CampaignCodeError } = require('../../domain/errors');

module.exports = async function linkUserToOrganizationStudentData({
  campaignCode,
  user,
  campaignRepository,
  studentRepository,
  userReconciliationService,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign || !campaign.organizationId) {
    throw new CampaignCodeError();
  }

  const studentId = await userReconciliationService.findMatchingStudentIdForGivenOrganizationIdAndUser({ organizationId: campaign.organizationId, user, studentRepository });

  return studentRepository.associateUserAndStudent({ userId: user.id, studentId });
};
