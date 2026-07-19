/**
 * @typedef {import ('../../../../lib/domain/usecases/index.js').OidcAuthenticationService} OidcAuthenticationService
 */

import { AuthenticationKeyExpired, DifferentExternalIdentifierError } from '../errors.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';
import { UserAccessToken } from '../models/UserAccessToken.js';

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
  authenticationSessionService,
  authenticationMethodRepository,
  userRepository,
  userLoginRepository,
  lastUserApplicationConnectionsRepository,
  requestedApplication,
  audience,
}) {
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

  const connectionMethodCode = oidcAuthenticationService.connectionMethodCode;
  identityProvider = connectionMethodCode || identityProvider;

  const authenticationComplement = oidcAuthenticationService.createAuthenticationComplement({ userInfo });
  await authenticationMethodRepository.create({
    authenticationMethod: new AuthenticationMethod({
      identityProvider,
      userId,
      externalIdentifier: externalIdentityId,
      authenticationComplement,
    }),
  });

  await _updateUserLastConnection({
    userId,
    requestedApplication,
    identityProvider,
    authenticationMethodRepository,
    lastUserApplicationConnectionsRepository,
    userLoginRepository,
  });

  const sessionId = authenticationSessionService.generateSessionId();
  const expiresIn = oidcAuthenticationService.sessionDurationSeconds;

  const { accessToken } = await UserAccessToken.generateOidcUserToken({ userId, audience, sessionId, expiresIn });
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
  identityProvider,
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
    identityProvider,
  });
}
