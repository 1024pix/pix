const { CampaignCodeError, SchoolingRegistrationAlreadyLinkedToUserError } = require('../errors');
const { STUDENT_RECONCILIATION_ERRORS } = require('../constants');
const get = require('lodash/get');

module.exports = async function reconcileSchoolingRegistration({
  campaignCode,
  reconciliationInfo,
  withReconciliation,
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
  if (get(student, 'account')) {
    await userReconciliationService.checkIfStudentHasAlreadyAccountsReconciledInOtherOrganizations(student.account.userId, userRepository, obfuscationService);
  }

  await _checkIfAnotherStudentIsAlreadyReconciledWithTheSameOrganizationAndUser(reconciliationInfo.id, campaign.organizationId, schoolingRegistrationRepository);

  if (withReconciliation) {
    return schoolingRegistrationRepository.reconcileUserToSchoolingRegistration({
      userId: reconciliationInfo.id,
      schoolingRegistrationId: matchedSchoolingRegistration.id,
    });
  }
};

async function _checkIfAnotherStudentIsAlreadyReconciledWithTheSameOrganizationAndUser(userId, organizationId, schoolingRegistrationRepository) {

  const schoolingRegistrationFound = await schoolingRegistrationRepository.findOneByUserIdAndOrganizationId({
    userId,
    organizationId,
  });

  if (schoolingRegistrationFound) {
    const detail = 'Un autre étudiant est déjà réconcilié dans la même organisation et avec le même compte utilisateur';
    const error = STUDENT_RECONCILIATION_ERRORS.RECONCILIATION.IN_SAME_ORGANIZATION.anotherStudentIsAlreadyReconciled;
    const meta = {
      shortCode: error.shortCode,
    };
    throw new SchoolingRegistrationAlreadyLinkedToUserError(detail, error.code, meta);
  }

}

