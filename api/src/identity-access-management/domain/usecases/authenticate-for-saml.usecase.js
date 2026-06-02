import {
  PasswordNotMatching,
  UnexpectedUserAccountError,
  UserAlreadyExistsWithAuthenticationMethodError,
  UserNotFoundError,
} from '../../../shared/domain/errors.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import { MissingOrInvalidCredentialsError, UserShouldChangePasswordError } from '../errors.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';
import { PasswordExpirationToken } from '../models/PasswordExpirationToken.js';
import { UserAccessToken } from '../models/UserAccessToken.js';
import { UserReconciliationSamlIdToken } from '../models/UserReconciliationSamlIdToken.js';

/**
 * @param {Object} params
 * @param {string} params.username
 * @param {string} params.password
 * @param {string} params.externalUserToken
 * @param {string} params.audience
 * @param {number} params.expectedUserId
 * @param {RequestedApplication} params.requestedApplication,
 * @param {TokenService} params.tokenService
 * @param {PixAuthenticationService} params.pixAuthenticationService
 * @param {ObfuscationService} params.obfuscationService
 * @param {AuthenticationMethodRepository} params.authenticationMethodRepository
 * @param {UserRepository} params.userRepository
 * @param {UserLoginRepository} params.userLoginRepository
 * @param {LastUserApplicationConnectionsRepository} params.lastUserApplicationConnectionsRepository,
 * @returns {Promise<*>}
 */
async function authenticateForSaml({
  username,
  password,
  externalUserToken,
  audience,
  expectedUserId,
  requestedApplication,
  tokenService,
  pixAuthenticationService,
  obfuscationService,
  authenticationMethodRepository,
  userRepository,
  userLoginRepository,
  lastUserApplicationConnectionsRepository,
}) {
  try {
    const userFromCredentials = await pixAuthenticationService.getUserByUsernameAndPassword({
      username,
      password,
      userRepository,
    });

    if (userFromCredentials.id !== expectedUserId) {
      const expectedUser = await userRepository.getForObfuscation(expectedUserId);
      const authenticationMethod = await obfuscationService.getUserAuthenticationMethodWithObfuscation(expectedUser);

      throw new UnexpectedUserAccountError({ message: undefined, meta: { value: authenticationMethod.value } });
    }

    await _addGarAuthenticationMethod({
      userId: userFromCredentials.id,
      externalUserToken,
      tokenService,
      authenticationMethodRepository,
      userRepository,
    });

    if (userFromCredentials.shouldChangePassword) {
      const passwordExpirationToken = PasswordExpirationToken.generate({ userId: userFromCredentials.id });
      throw new UserShouldChangePasswordError(undefined, passwordExpirationToken);
    }

    const { accessToken } = UserAccessToken.generateSamlUserToken({ userId: userFromCredentials.id, audience });

    await _updateLastLoggedDates({
      user: userFromCredentials,
      requestedApplication,
      userLoginRepository,
      authenticationMethodRepository,
      lastUserApplicationConnectionsRepository,
    });

    return accessToken;
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      throw new MissingOrInvalidCredentialsError();
    } else if (error instanceof PasswordNotMatching) {
      throw new MissingOrInvalidCredentialsError(error.meta);
    } else {
      throw error;
    }
  }
}

async function _addGarAuthenticationMethod({
  userId,
  externalUserToken,
  authenticationMethodRepository,
  userRepository,
}) {
  const { samlId, firstName, lastName } = UserReconciliationSamlIdToken.decode(externalUserToken);
  await _checkIfSamlIdIsNotReconciledWithAnotherUser({ samlId, userId, userRepository });

  const garAuthenticationMethod = new AuthenticationMethod({
    userId,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
    externalIdentifier: samlId,
    authenticationComplement: new AuthenticationMethod.GARAuthenticationComplement({ firstName, lastName }),
  });
  await authenticationMethodRepository.create({ authenticationMethod: garAuthenticationMethod });
}

async function _checkIfSamlIdIsNotReconciledWithAnotherUser({ samlId, userId, userRepository }) {
  const userFromCredentialsBySamlId = await userRepository.getBySamlId(samlId);
  if (userFromCredentialsBySamlId && userFromCredentialsBySamlId.id !== userId) {
    throw new UserAlreadyExistsWithAuthenticationMethodError();
  }
}

async function _updateLastLoggedDates({
  user,
  requestedApplication,
  userLoginRepository,
  authenticationMethodRepository,
  lastUserApplicationConnectionsRepository,
}) {
  await userLoginRepository.updateLastLoggedAt({ userId: user.id });

  await lastUserApplicationConnectionsRepository.upsert({
    userId: user.id,
    application: requestedApplication.applicationName,
    lastLoggedAt: new Date(),
  });

  await authenticationMethodRepository.updateLastLoggedAtByIdentityProvider({
    userId: user.id,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
  });
}

export { authenticateForSaml };
