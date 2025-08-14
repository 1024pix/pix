import {
  UnexpectedUserAccountError,
  UserAlreadyExistsWithAuthenticationMethodError,
  UserNotFoundError,
} from '../../../shared/domain/errors.js';
import * as injectedObfuscationService from '../../../shared/domain/services/obfuscation-service.js';
import { tokenService as injectedTokenService } from '../../../shared/domain/services/token-service.js';
import * as injectedUserLoginRepository from '../../../shared/infrastructure/repositories/user-login-repository.js';
import * as injectedAuthenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';
import { lastUserApplicationConnectionsRepository as injectedLastUserApplicationConnectionsRepository } from '../../infrastructure/repositories/last-user-application-connections.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import { MissingOrInvalidCredentialsError, PasswordNotMatching, UserShouldChangePasswordError } from '../errors.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';
import { pixAuthenticationService as injectedPixAuthenticationService } from '../services/pix-authentication-service.js';

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
  tokenService = injectedTokenService,
  pixAuthenticationService = injectedPixAuthenticationService,
  obfuscationService = injectedObfuscationService,
  authenticationMethodRepository = injectedAuthenticationMethodRepository,
  userRepository = injectedUserRepository,
  userLoginRepository = injectedUserLoginRepository,
  lastUserApplicationConnectionsRepository = injectedLastUserApplicationConnectionsRepository,
} = {}) {
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
      const passwordResetToken = tokenService.createPasswordResetToken(userFromCredentials.id);
      throw new UserShouldChangePasswordError(undefined, passwordResetToken);
    }

    const token = tokenService.createAccessTokenForSaml({ userId: userFromCredentials.id, audience });

    await _updateLastLoggedDates({
      user: userFromCredentials,
      requestedApplication,
      userLoginRepository,
      authenticationMethodRepository,
      lastUserApplicationConnectionsRepository,
    });

    return token;
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
  tokenService,
  authenticationMethodRepository,
  userRepository,
}) {
  const { samlId, firstName, lastName } = await tokenService.extractExternalUserFromIdToken(externalUserToken);
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
