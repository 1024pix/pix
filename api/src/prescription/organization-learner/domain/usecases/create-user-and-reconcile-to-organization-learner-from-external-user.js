import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../identity-access-management/domain/constants/identity-providers.js';
import { AuthenticationMethod } from '../../../../identity-access-management/domain/models/AuthenticationMethod.js';
import { User } from '../../../../identity-access-management/domain/models/User.js';
import { UserAccessToken } from '../../../../identity-access-management/domain/models/UserAccessToken.js';
import { UserReconciliationSamlIdToken } from '../../../../identity-access-management/domain/models/UserReconciliationSamlIdToken.js';
import { STUDENT_RECONCILIATION_ERRORS } from '../../../../shared/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { ObjectValidationError } from '../../../../shared/domain/errors.js';

const existingUserReconciliationErrors = [
  STUDENT_RECONCILIATION_ERRORS.RECONCILIATION.IN_SAME_ORGANIZATION.samlId.code,
  STUDENT_RECONCILIATION_ERRORS.RECONCILIATION.IN_OTHER_ORGANIZATION.samlId.code,
];

const createUserAndReconcileToOrganizationLearnerFromExternalUser = async function ({
  birthdate,
  organizationId,
  token,
  locale,
  obfuscationService,
  audience,
  requestedApplication,
  userReconciliationService,
  userService,
  authenticationMethodRepository,
  userRepository,
  userLoginRepository,
  userToCreateRepository,
  libOrganizationLearnerRepository,
  prescriptionOrganizationLearnerRepository,
  lastUserApplicationConnectionsRepository,
  studentRepository,
}) {
  const { firstName, lastName, samlId } = UserReconciliationSamlIdToken.decode(token);

  if (!firstName || !lastName || !samlId) {
    throw new ObjectValidationError('Missing claim(s) in IdToken');
  }

  const reconciliationInfo = {
    firstName,
    lastName,
    birthdate,
  };

  let matchedOrganizationLearner;
  let userWithSamlId;
  let userId;

  try {
    matchedOrganizationLearner =
      await userReconciliationService.findMatchingOrganizationLearnerForGivenOrganizationIdAndReconciliationInfo({
        organizationId,
        reconciliationInfo,
        organizationLearnerRepository: libOrganizationLearnerRepository,
      });

    await userReconciliationService.assertStudentHasAnAlreadyReconciledAccount(
      matchedOrganizationLearner,
      obfuscationService,
      studentRepository,
    );

    userWithSamlId = await userRepository.getBySamlId(samlId);
    if (!userWithSamlId) {
      const domainUser = new User({
        firstName,
        lastName,
        cgu: false,
      });
      await DomainTransaction.execute(async () => {
        userId = await userService.createUserWithGarOrPassword({
          user: domainUser,
          samlId,
          locale,
          authenticationMethodRepository,
          userToCreateRepository,
        });
        await libOrganizationLearnerRepository.updateUserIdWhereNull({
          organizationLearnerId: matchedOrganizationLearner.id,
          userId,
        });
      });
    }
  } catch (error) {
    if (existingUserReconciliationErrors.includes(error.code)) {
      const reconciliationUserId = error.meta.userId;
      const identityProvider = NON_OIDC_IDENTITY_PROVIDERS.GAR.code;

      await DomainTransaction.execute(async () => {
        await authenticationMethodRepository.updateExternalIdentifierByUserIdAndIdentityProvider({
          externalIdentifier: samlId,
          userId: reconciliationUserId,
          identityProvider,
        });

        const authenticationComplement = new AuthenticationMethod.GARAuthenticationComplement({
          firstName,
          lastName,
        });
        await authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider({
          authenticationComplement,
          userId: reconciliationUserId,
          identityProvider,
        });
        const organizationLearner = await prescriptionOrganizationLearnerRepository.reconcileUserToOrganizationLearner({
          userId: reconciliationUserId,
          organizationLearnerId: matchedOrganizationLearner.id,
        });
        userId = organizationLearner.userId;
      });
    } else {
      throw error;
    }
  }
  const tokenUserId = userWithSamlId ? userWithSamlId.id : userId;

  await _updateUserLastConnection({
    userId: tokenUserId,
    requestedApplication,
    authenticationMethodRepository,
    lastUserApplicationConnectionsRepository,
    userLoginRepository,
  });

  const { accessToken } = UserAccessToken.generateSamlUserToken({ userId: tokenUserId, audience });

  return accessToken;
};

export { createUserAndReconcileToOrganizationLearnerFromExternalUser };

async function _updateUserLastConnection({
  userId,
  requestedApplication,
  authenticationMethodRepository,
  lastUserApplicationConnectionsRepository,
  userLoginRepository,
}) {
  await userLoginRepository.updateLastLoggedAt({ userId });
  await lastUserApplicationConnectionsRepository.upsert({
    userId,
    application: requestedApplication.applicationName,
    lastLoggedAt: new Date(),
  });
  await authenticationMethodRepository.updateLastLoggedAtByIdentityProvider({
    userId,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
  });
}
