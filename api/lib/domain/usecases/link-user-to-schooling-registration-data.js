const { CampaignCodeError } = require('../../domain/errors');

module.exports = async function linkUserToSchoolingRegistrationData({
  campaignCode,
  user,
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

  const matchedSchoolingRegistration = await userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser({ organizationId: campaign.organizationId, user, schoolingRegistrationRepository, studentRepository, userRepository });

  const student = await studentRepository.getReconciledStudentByNationalStudentId(matchedSchoolingRegistration.nationalStudentId);

  await userReconciliationService.checkIfStudentHasAlreadyAccountsReconciledInOtherOrganizations(student, userRepository);

  return schoolingRegistrationRepository.associateUserAndSchoolingRegistration({ userId: user.id, schoolingRegistrationId: matchedSchoolingRegistration.id });
};
