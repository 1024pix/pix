import { AuthenticationKeyExpired, MissingUserAccountError } from '../errors.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';

/**
 * @typedef {function} reconcileOidcUserUseCase
 * @param {Object} params
 * @param {string} params.authenticationKey
 * @param {string} params.identityProvider
 * @param {string} params.audience
 * @param {RequestedApplication} params.requestedApplication
 * @param {AuthenticationSessionService} params.authenticationSessionService
 * @param {AuthenticationMethodRepository} params.authenticationMethodRepository
 * @param {OidcAuthenticationServiceRegistry} params.oidcAuthenticationServiceRegistry
 * @param {UserLoginRepository} params.userLoginRepository
 * @param {LastUserApplicationConnectionsRepository} params.lastUserApplicationConnectionsRepository
 * @param {RequestedApplication} params.requestedApplication
 * @return {Promise<{accessToken: string, logoutUrlUUID: string}|AuthenticationKeyExpired|MissingUserAccountError>}
 */
export const reconcileOidcUser = async function ({
  authenticationKey,
  identityProvider,
  authenticationSessionService,
  authenticationMethodRepository,
  oidcAuthenticationServiceRegistry,
  userLoginRepository,
  lastUserApplicationConnectionsRepository,
  audience,
  requestedApplication,
}) {
  await oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  await oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode(identityProvider);

  const oidcAuthenticationService = oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
    requestedApplication,
  });

  const sessionContentAndUserInfo = await authenticationSessionService.getByKey(authenticationKey);
  if (!sessionContentAndUserInfo) {
    throw new AuthenticationKeyExpired();
  }

  const { userInfo, sessionContent } = sessionContentAndUserInfo;
  if (!userInfo?.userId) {
    throw new MissingUserAccountError();
  }

  const { userId, externalIdentityId } = userInfo;

  const hasConnectionMethodCode = !!oidcAuthenticationService.connectionMethodCode;
  const preferredIdentityProviderName = hasConnectionMethodCode
    ? oidcAuthenticationService.connectionMethodCode
    : oidcAuthenticationService.identityProvider;

  const authenticationComplement = oidcAuthenticationService.createAuthenticationComplement({
    userInfo,
    sessionContent,
  });
  await authenticationMethodRepository.create({
    authenticationMethod: new AuthenticationMethod({
      identityProvider: preferredIdentityProviderName,
      userId,
      externalIdentifier: externalIdentityId,
      authenticationComplement,
    }),
  });

  await _updateUserLastConnection({
    userId,
    requestedApplication,
    preferredIdentityProviderName,
    authenticationMethodRepository,
    lastUserApplicationConnectionsRepository,
    userLoginRepository,
  });

  const accessToken = await oidcAuthenticationService.createAccessToken({ userId, audience });

  let logoutUrlUUID;
  if (oidcAuthenticationService.shouldCloseSession) {
    logoutUrlUUID = await oidcAuthenticationService.saveIdToken({
      idToken: sessionContent.idToken,
      userId,
    });
  }

  return { accessToken, logoutUrlUUID };
};

async function _updateUserLastConnection({
  userId,
  requestedApplication,
  preferredIdentityProviderName,
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
    identityProvider: preferredIdentityProviderName,
  });
}
