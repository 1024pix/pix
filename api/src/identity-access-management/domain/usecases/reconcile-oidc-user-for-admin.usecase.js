/**
 * @typedef {import ('../../../../lib/domain/usecases/index.js').OidcAuthenticationService} OidcAuthenticationService
 */

import * as injectedUserLoginRepository from '../../../shared/infrastructure/repositories/user-login-repository.js';
import * as injectedAuthenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';
import { lastUserApplicationConnectionsRepository as injectedLastUserApplicationConnectionsRepository } from '../../infrastructure/repositories/last-user-application-connections.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
import { AuthenticationKeyExpired, DifferentExternalIdentifierError } from '../errors.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';
import { authenticationSessionService as injectedAuthenticationSessionService } from '../services/authentication-session.service.js';

/**
 * @param {Object} params
 * @param {string} params.authenticationKey
 * @param {string} params.email
 * @param {string} params.identityProvider
 * @param {string} params.audience
 * @param {OidcAuthenticationService} params.oidcAuthenticationService
 * @param {RequestedApplication} params.requestedApplication
 * @param {lastUserApplicationConnectionsRepository} params.lastUserApplicationConnectionsRepository
 * @param {AuthenticationSessionService} params.authenticationSessionService
 * @param {AuthenticationMethodRepository} params.authenticationMethodRepository
 * @param {UserRepository} params.userRepository
 * @param {UserLoginRepository} params.userLoginRepository
 */
export const reconcileOidcUserForAdmin = async function ({
  authenticationKey,
  email,
  identityProvider,
  oidcAuthenticationService,
  authenticationSessionService = injectedAuthenticationSessionService,
  authenticationMethodRepository = injectedAuthenticationMethodRepository,
  userRepository = injectedUserRepository,
  userLoginRepository = injectedUserLoginRepository,
  lastUserApplicationConnectionsRepository = injectedLastUserApplicationConnectionsRepository,
  requestedApplication,
  audience,
} = {}) {
  const sessionContentAndUserInfo = await authenticationSessionService.getByKey(authenticationKey);
  if (!sessionContentAndUserInfo) {
    throw new AuthenticationKeyExpired();
  }

  const foundUser = await userRepository.getByEmail(email);
  const userId = foundUser.id;

  await _assertExternalIdentifier({
    sessionContentAndUserInfo,
    identityProvider,
    userId,
    authenticationMethodRepository,
  });

  const { userInfo } = sessionContentAndUserInfo;
  const { externalIdentityId } = userInfo;

  const authenticationComplement = oidcAuthenticationService.createAuthenticationComplement({ userInfo });
  await authenticationMethodRepository.create({
    authenticationMethod: new AuthenticationMethod({
      identityProvider: oidcAuthenticationService.identityProvider,
      userId,
      externalIdentifier: externalIdentityId,
      authenticationComplement,
    }),
  });

  await _updateUserLastConnection({
    userId,
    requestedApplication,
    oidcAuthenticationService,
    authenticationMethodRepository,
    lastUserApplicationConnectionsRepository,
    userLoginRepository,
  });

  const accessToken = await oidcAuthenticationService.createAccessToken({ userId, audience });

  return accessToken;
};

async function _assertExternalIdentifier({
  sessionContentAndUserInfo,
  identityProvider,
  userId,
  authenticationMethodRepository,
}) {
  const oidcAuthenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
    userId,
    identityProvider,
  });

  const isSameExternalIdentifier =
    oidcAuthenticationMethod?.externalIdentifier === sessionContentAndUserInfo.userInfo.externalIdentityId;

  if (oidcAuthenticationMethod && !isSameExternalIdentifier) {
    throw new DifferentExternalIdentifierError();
  }
}

async function _updateUserLastConnection({
  userId,
  requestedApplication,
  oidcAuthenticationService,
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
    identityProvider: oidcAuthenticationService.identityProvider,
  });
}
