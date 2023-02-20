import {
  CampaignCodeError,
  OrganizationLearnerAlreadyLinkedToUserError,
  UserShouldNotBeReconciledOnAnotherAccountError,
} from '../errors';

import { STUDENT_RECONCILIATION_ERRORS } from '../constants';
import isEmpty from 'lodash/isEmpty';

export default async function reconcileScoOrganizationLearnerManually({
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

  const organizationLearnerOfUserAccessingCampaign =
    await userReconciliationService.findMatchingOrganizationLearnerIdForGivenOrganizationIdAndUser({
      organizationId: campaign.organizationId,
      reconciliationInfo,
      organizationLearnerRepository,
    });

  await userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount(
    organizationLearnerOfUserAccessingCampaign,
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
    organizationLearnerOfUserAccessingCampaign,
    authenticatedUserId: reconciliationInfo.id,
    organizationLearnerRepository,
  });

  if (withReconciliation) {
    return organizationLearnerRepository.reconcileUserToOrganizationLearner({
      userId: reconciliationInfo.id,
      organizationLearnerId: organizationLearnerOfUserAccessingCampaign.id,
    });
  }
}

async function _checkIfAnotherStudentIsAlreadyReconciledWithTheSameOrganizationAndUser(
  userId,
  organizationId,
  organizationLearnerRepository
) {
  const organizationLearnerFound = await organizationLearnerRepository.findOneByUserIdAndOrganizationId({
    userId,
    organizationId,
  });

  if (organizationLearnerFound) {
    const detail = 'Un autre étudiant est déjà réconcilié dans la même organisation et avec le même compte utilisateur';
    const error = STUDENT_RECONCILIATION_ERRORS.RECONCILIATION.IN_SAME_ORGANIZATION.anotherStudentIsAlreadyReconciled;
    const meta = {
      shortCode: error.shortCode,
    };
    throw new OrganizationLearnerAlreadyLinkedToUserError(detail, error.code, meta);
  }
}

async function _checkIfUserIsConnectedOnAnotherAccount({
  organizationLearnerOfUserAccessingCampaign,
  authenticatedUserId,
  organizationLearnerRepository,
}) {
  const loggedAccountReconciledOrganizationLearners = await organizationLearnerRepository.findByUserId({
    userId: authenticatedUserId,
  });

  const loggedAccountReconciledOrganizationLearnersWithoutNullNationalStudentIds =
    loggedAccountReconciledOrganizationLearners.filter(
      (organizationLearner) => !!organizationLearner.nationalStudentId
    );

  if (isEmpty(loggedAccountReconciledOrganizationLearnersWithoutNullNationalStudentIds)) {
    return;
  }

  const isUserNationalStudentIdDifferentFromLoggedAccount =
    loggedAccountReconciledOrganizationLearnersWithoutNullNationalStudentIds.every(
      (organizationLearner) =>
        organizationLearner.nationalStudentId !== organizationLearnerOfUserAccessingCampaign.nationalStudentId
    );

  if (isUserNationalStudentIdDifferentFromLoggedAccount) {
    const isUserBirthdayDifferentFromLoggedAccount =
      loggedAccountReconciledOrganizationLearnersWithoutNullNationalStudentIds.every(
        (organizationLearner) => organizationLearner.birthdate !== organizationLearnerOfUserAccessingCampaign.birthdate
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
