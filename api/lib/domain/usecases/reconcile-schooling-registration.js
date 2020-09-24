const { CampaignCodeError } = require('../errors');

module.exports = async function reconcileSchoolingRegistration({
  campaignCode,
  reconciliationInfo,
  campaignRepository,
  schoolingRegistrationRepository,
  studentRepository,
  userRepository,
  obfuscationService,
  userReconciliationService,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign) {
    throw new CampaignCodeError();
  }

  const matchedSchoolingRegistration = await userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser({
    organizationId: campaign.organizationId,
    reconciliationInfo,
    schoolingRegistrationRepository,
    userRepository,
    obfuscationService,
  });
  const student = await studentRepository.getReconciledStudentByNationalStudentId(matchedSchoolingRegistration.nationalStudentId);
  await userReconciliationService.checkIfStudentHasAlreadyAccountsReconciledInOtherOrganizations(student, userRepository, obfuscationService);

  return schoolingRegistrationRepository.reconcileUserToSchoolingRegistration({ userId: reconciliationInfo.id, schoolingRegistrationId: matchedSchoolingRegistration.id });
};
