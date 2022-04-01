const {
  CampaignCodeError,
  SchoolingRegistrationAlreadyLinkedToUserError,
  UserShouldNotBeReconciledOnAnotherAccountError,
} = require('../errors');
const { STUDENT_RECONCILIATION_ERRORS } = require('../constants');
const isEmpty = require('lodash/isEmpty');

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

  const schoolingRegistrationOfUserAccessingCampaign =
    await userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser({
      organizationId: campaign.organizationId,
      reconciliationInfo,
      schoolingRegistrationRepository,
    });

  await userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount(
    schoolingRegistrationOfUserAccessingCampaign,
    userRepository,
    obfuscationService,
    studentRepository
  );

  await _checkIfAnotherStudentIsAlreadyReconciledWithTheSameOrganizationAndUser(
    reconciliationInfo.id,
    campaign.organizationId,
    schoolingRegistrationRepository
  );

  await _checkIfUserIsConnectedOnAnotherAccount({
    schoolingRegistrationOfUserAccessingCampaign,
    authenticatedUserId: reconciliationInfo.id,
    schoolingRegistrationRepository,
  });

  if (withReconciliation) {
    return schoolingRegistrationRepository.reconcileUserToSchoolingRegistration({
      userId: reconciliationInfo.id,
      schoolingRegistrationId: schoolingRegistrationOfUserAccessingCampaign.id,
    });
  }
};

async function _checkIfAnotherStudentIsAlreadyReconciledWithTheSameOrganizationAndUser(
  userId,
  organizationId,
  schoolingRegistrationRepository
) {
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

async function _checkIfUserIsConnectedOnAnotherAccount({
  schoolingRegistrationOfUserAccessingCampaign,
  authenticatedUserId,
  schoolingRegistrationRepository,
}) {
  const loggedAccountReconciledSchoolingRegistrations = await schoolingRegistrationRepository.findByUserId({
    userId: authenticatedUserId,
  });

  const loggedAccountReconciledSchoolingRegistrationsWithoutNullNationalStudentIds =
    loggedAccountReconciledSchoolingRegistrations.filter(
      (schoolingRegistration) => !!schoolingRegistration.nationalStudentId
    );

  if (isEmpty(loggedAccountReconciledSchoolingRegistrationsWithoutNullNationalStudentIds)) {
    return;
  }

  const isUserNationalStudentIdDifferentFromLoggedAccount =
    loggedAccountReconciledSchoolingRegistrationsWithoutNullNationalStudentIds.every(
      (schoolingRegistration) =>
        schoolingRegistration.nationalStudentId !== schoolingRegistrationOfUserAccessingCampaign.nationalStudentId
    );

  if (isUserNationalStudentIdDifferentFromLoggedAccount) {
    const isUserBirthdayDifferentFromLoggedAccount =
      loggedAccountReconciledSchoolingRegistrationsWithoutNullNationalStudentIds.every(
        (schoolingRegistration) =>
          schoolingRegistration.birthdate !== schoolingRegistrationOfUserAccessingCampaign.birthdate
      );

    if (isUserBirthdayDifferentFromLoggedAccount) {
      const error = STUDENT_RECONCILIATION_ERRORS.RECONCILIATION.ACCOUNT_BELONGING_TO_ANOTHER_USER;
      const meta = {
        shortCode: error.shortCode,
      };
      throw new UserShouldNotBeReconciledOnAnotherAccountError({ code: error.code, meta });
    }
  }
}
