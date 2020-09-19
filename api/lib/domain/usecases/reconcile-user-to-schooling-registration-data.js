const { CampaignCodeError } = require('../errors');

module.exports = async function reconcileUserToSchoolingRegistrationData({
  campaignCode,
  reconciliationInfo,
  campaignRepository,
  organizationRepository,
  schoolingRegistrationRepository,
  studentRepository,
  userRepository,
  obfuscationService,
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
    userRepository,
    obfuscationService,
  });
  const organization = await organizationRepository.get(campaign.organizationId);
  if (organization.isSco) {
    const student = await studentRepository.getReconciledStudentByNationalStudentId(matchedSchoolingRegistration.nationalStudentId);
    await userReconciliationService.checkIfStudentHasAlreadyAccountsReconciledInOtherOrganizations(student, userRepository, obfuscationService);
  }

  return schoolingRegistrationRepository.reconcileUserToSchoolingRegistration({ userId: reconciliationInfo.id, schoolingRegistrationId: matchedSchoolingRegistration.id });
};
