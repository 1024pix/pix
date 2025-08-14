import lodash from 'lodash';

import * as injectedUserRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import { STUDENT_RECONCILIATION_ERRORS } from '../../../../shared/domain/constants.js';
import {
  OrganizationLearnerAlreadyLinkedToUserError,
  UserShouldNotBeReconciledOnAnotherAccountError,
} from '../../../../shared/domain/errors.js';
import * as injectedObfuscationService from '../../../../shared/domain/services/obfuscation-service.js';
import * as injectedUserReconciliationService from '../../../../shared/domain/services/user-reconciliation-service.js';
import * as injectedLibOrganizationLearnerRepository from '../../../organization-learner/infrastructure/repositories/organization-learner-repository.js';
import * as injectedRegistrationOrganizationLearnerRepository from '../../../organization-learner/infrastructure/repositories/registration-organization-learner-repository.js';
import * as injectedOrganizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
import * as injectedStudentRepository from '../../infrastructure/repositories/student-repository.js';

const { isEmpty } = lodash;

const reconcileScoOrganizationLearnerManually = async function ({
  organizationId,
  reconciliationInfo,
  withReconciliation,
  libOrganizationLearnerRepository = injectedLibOrganizationLearnerRepository,
  organizationLearnerRepository = injectedOrganizationLearnerRepository,
  registrationOrganizationLearnerRepository = injectedRegistrationOrganizationLearnerRepository,
  studentRepository = injectedStudentRepository,
  userRepository = injectedUserRepository,
  obfuscationService = injectedObfuscationService,
  userReconciliationService = injectedUserReconciliationService,
} = {}) {
  const organizationLearnerOfUserAccessingCampaign =
    await userReconciliationService.findMatchingOrganizationLearnerForGivenOrganizationIdAndReconciliationInfo({
      organizationId,
      reconciliationInfo,
      organizationLearnerRepository: libOrganizationLearnerRepository,
    });

  await userReconciliationService.assertStudentHasAnAlreadyReconciledAccount(
    organizationLearnerOfUserAccessingCampaign,
    userRepository,
    obfuscationService,
    studentRepository,
  );

  await _checkIfAnotherStudentIsAlreadyReconciledWithTheSameOrganizationAndUser(
    reconciliationInfo.id,
    organizationId,
    registrationOrganizationLearnerRepository,
  );

  await _checkIfUserIsConnectedOnAnotherAccount({
    organizationLearnerOfUserAccessingCampaign,
    authenticatedUserId: reconciliationInfo.id,
    libOrganizationLearnerRepository,
  });

  if (withReconciliation) {
    return organizationLearnerRepository.reconcileUserToOrganizationLearner({
      userId: reconciliationInfo.id,
      organizationLearnerId: organizationLearnerOfUserAccessingCampaign.id,
    });
  }
};

export { reconcileScoOrganizationLearnerManually };

async function _checkIfAnotherStudentIsAlreadyReconciledWithTheSameOrganizationAndUser(
  userId,
  organizationId,
  registrationOrganizationLearnerRepository,
) {
  const organizationLearnerFound = await registrationOrganizationLearnerRepository.findOneByUserIdAndOrganizationId({
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
  libOrganizationLearnerRepository,
}) {
  const loggedAccountReconciledOrganizationLearners = await libOrganizationLearnerRepository.findByUserId({
    userId: authenticatedUserId,
  });

  const loggedAccountReconciledOrganizationLearnersWithoutNullNationalStudentIds =
    loggedAccountReconciledOrganizationLearners.filter(
      (organizationLearner) => !!organizationLearner.nationalStudentId,
    );

  if (isEmpty(loggedAccountReconciledOrganizationLearnersWithoutNullNationalStudentIds)) {
    return;
  }

  const isUserNationalStudentIdDifferentFromLoggedAccount =
    loggedAccountReconciledOrganizationLearnersWithoutNullNationalStudentIds.every(
      (organizationLearner) =>
        organizationLearner.nationalStudentId !== organizationLearnerOfUserAccessingCampaign.nationalStudentId,
    );

  if (isUserNationalStudentIdDifferentFromLoggedAccount) {
    const isUserBirthdayDifferentFromLoggedAccount =
      loggedAccountReconciledOrganizationLearnersWithoutNullNationalStudentIds.every(
        (organizationLearner) => organizationLearner.birthdate !== organizationLearnerOfUserAccessingCampaign.birthdate,
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
