import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../identity-access-management/domain/constants/identity-providers.js';
import { AuthenticationMethod } from '../../../../identity-access-management/domain/models/AuthenticationMethod.js';
import { User } from '../../../../identity-access-management/domain/models/User.js';
import * as injectedAuthenticationMethodRepository from '../../../../identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import { lastUserApplicationConnectionsRepository as injectedLastUserApplicationConnectionsRepository } from '../../../../identity-access-management/infrastructure/repositories/last-user-application-connections.repository.js';
import * as injectedUserRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import { userToCreateRepository as injectedUserToCreateRepository } from '../../../../identity-access-management/infrastructure/repositories/user-to-create.repository.js';
import { STUDENT_RECONCILIATION_ERRORS } from '../../../../shared/domain/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { ObjectValidationError } from '../../../../shared/domain/errors.js';
import * as injectedObfuscationService from '../../../../shared/domain/services/obfuscation-service.js';
import { tokenService as injectedTokenService } from '../../../../shared/domain/services/token-service.js';
import * as injectedUserReconciliationService from '../../../../shared/domain/services/user-reconciliation-service.js';
import * as injectedUserService from '../../../../shared/domain/services/user-service.js';
import * as injectedUserLoginRepository from '../../../../shared/infrastructure/repositories/user-login-repository.js';
import * as injectedPrescriptionOrganizationLearnerRepository from '../../../learner-management/infrastructure/repositories/organization-learner-repository.js';
import * as injectedStudentRepository from '../../../learner-management/infrastructure/repositories/student-repository.js';
import * as injectedLibOrganizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';

const existingUserReconciliationErrors = [
  STUDENT_RECONCILIATION_ERRORS.RECONCILIATION.IN_SAME_ORGANIZATION.samlId.code,
  STUDENT_RECONCILIATION_ERRORS.RECONCILIATION.IN_OTHER_ORGANIZATION.samlId.code,
];

const createUserAndReconcileToOrganizationLearnerFromExternalUser = async function ({
  birthdate,
  organizationId,
  token,
  obfuscationService = injectedObfuscationService,
  tokenService = injectedTokenService,
  audience,
  requestedApplication,
  userReconciliationService = injectedUserReconciliationService,
  userService = injectedUserService,
  authenticationMethodRepository = injectedAuthenticationMethodRepository,
  userRepository = injectedUserRepository,
  userLoginRepository = injectedUserLoginRepository,
  userToCreateRepository = injectedUserToCreateRepository,
  libOrganizationLearnerRepository = injectedLibOrganizationLearnerRepository,
  prescriptionOrganizationLearnerRepository = injectedPrescriptionOrganizationLearnerRepository,
  lastUserApplicationConnectionsRepository = injectedLastUserApplicationConnectionsRepository,
  studentRepository = injectedStudentRepository,
} = {}) {
  const externalUser = await tokenService.extractExternalUserFromIdToken(token);
  const firstName = externalUser.firstName;
  const lastName = externalUser.lastName;
  const samlId = externalUser.samlId;

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
      userRepository,
      obfuscationService,
      studentRepository,
    );

    userWithSamlId = await userRepository.getBySamlId(externalUser.samlId);
    if (!userWithSamlId) {
      const domainUser = new User({
        firstName,
        lastName,
        cgu: false,
      });
      userId = await userService.createAndReconcileUserToOrganizationLearner({
        user: domainUser,
        organizationLearnerId: matchedOrganizationLearner.id,
        samlId,
        authenticationMethodRepository,
        organizationLearnerRepository: libOrganizationLearnerRepository,
        userToCreateRepository,
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

  const accessToken = tokenService.createAccessTokenForSaml({ userId: tokenUserId, audience });

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
