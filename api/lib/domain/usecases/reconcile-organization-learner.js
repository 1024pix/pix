const {
  CampaignCodeError,
  OrganizationLearnerAlreadyLinkedToUserError,
  UserShouldNotBeReconciledOnAnotherAccountError,
} = require('../errors');
const { STUDENT_RECONCILIATION_ERRORS } = require('../constants');
const isEmpty = require('lodash/isEmpty');

module.exports = async function reconcileOrganizationLearner({
  campaignCode,
  reconciliationInfo,
  withReconciliation,
  campaignRepository,
  organizationLearnerRepository,
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
    await userReconciliationService.findMatchingOrganizationLearnerIdForGivenOrganizationIdAndUser({
      organizationId: campaign.organizationId,
      reconciliationInfo,
      organizationLearnerRepository,
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
    organizationLearnerRepository
  );

  await _checkIfUserIsConnectedOnAnotherAccount({
    schoolingRegistrationOfUserAccessingCampaign,
    authenticatedUserId: reconciliationInfo.id,
    organizationLearnerRepository,
  });

  if (withReconciliation) {
    return organizationLearnerRepository.reconcileUserToOrganizationLearner({
      userId: reconciliationInfo.id,
      organizationLearnerId: schoolingRegistrationOfUserAccessingCampaign.id,
    });
  }
};

async function _checkIfAnotherStudentIsAlreadyReconciledWithTheSameOrganizationAndUser(
  userId,
  organizationId,
  organizationLearnerRepository
) {
  const schoolingRegistrationFound = await organizationLearnerRepository.findOneByUserIdAndOrganizationId({
    userId,
    organizationId,
  });

  if (schoolingRegistrationFound) {
    const detail = 'Un autre étudiant est déjà réconcilié dans la même organisation et avec le même compte utilisateur';
    const error = STUDENT_RECONCILIATION_ERRORS.RECONCILIATION.IN_SAME_ORGANIZATION.anotherStudentIsAlreadyReconciled;
    const meta = {
      shortCode: error.shortCode,
    };
    throw new OrganizationLearnerAlreadyLinkedToUserError(detail, error.code, meta);
  }
}

async function _checkIfUserIsConnectedOnAnotherAccount({
  schoolingRegistrationOfUserAccessingCampaign,
  authenticatedUserId,
  organizationLearnerRepository,
}) {
  const loggedAccountReconciledOrganizationLearners = await organizationLearnerRepository.findByUserId({
    userId: authenticatedUserId,
  });

  const loggedAccountReconciledOrganizationLearnersWithoutNullNationalStudentIds =
    loggedAccountReconciledOrganizationLearners.filter(
      (schoolingRegistration) => !!schoolingRegistration.nationalStudentId
    );

  if (isEmpty(loggedAccountReconciledOrganizationLearnersWithoutNullNationalStudentIds)) {
    return;
  }

  const isUserNationalStudentIdDifferentFromLoggedAccount =
    loggedAccountReconciledOrganizationLearnersWithoutNullNationalStudentIds.every(
      (schoolingRegistration) =>
        schoolingRegistration.nationalStudentId !== schoolingRegistrationOfUserAccessingCampaign.nationalStudentId
    );

  if (isUserNationalStudentIdDifferentFromLoggedAccount) {
    const isUserBirthdayDifferentFromLoggedAccount =
      loggedAccountReconciledOrganizationLearnersWithoutNullNationalStudentIds.every(
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
