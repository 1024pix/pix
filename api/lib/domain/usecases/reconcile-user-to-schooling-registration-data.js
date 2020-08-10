const { CampaignCodeError } = require('../errors');

module.exports = async function reconcileUserToSchoolingRegistrationData({
  campaignCode,
  reconciliationInfo,
  campaignRepository,
  schoolingRegistrationRepository,
  studentRepository,
  userRepository,
  userReconciliationService,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign || !campaign.organizationId) {
    throw new CampaignCodeError();
  }

  const matchedSchoolingRegistration = await userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser({
    organizationId: campaign.organizationId,
    reconciliationInfo,
    schoolingRegistrationRepository,
    studentRepository,
    userRepository
  });

  const student = await studentRepository.getReconciledStudentByNationalStudentId(matchedSchoolingRegistration.nationalStudentId);

  await userReconciliationService.checkIfStudentHasAlreadyAccountsReconciledInOtherOrganizations(student, userRepository);

  return schoolingRegistrationRepository.reconcileUserToSchoolingRegistration({ userId: user.id, schoolingRegistrationId: matchedSchoolingRegistration.id });
};
