import { oidcAuthenticationServiceRegistry as injectedOidcAuthenticationServiceRegistry } from '../../../../lib/domain/usecases/index.js';
import * as injectedUserLoginRepository from '../../../shared/infrastructure/repositories/user-login-repository.js';
import * as injectedAuthenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';
import { lastUserApplicationConnectionsRepository as injectedLastUserApplicationConnectionsRepository } from '../../infrastructure/repositories/last-user-application-connections.repository.js';
import { AuthenticationKeyExpired, MissingUserAccountError } from '../errors.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';
import { authenticationSessionService as injectedAuthenticationSessionService } from '../services/authentication-session.service.js';

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
  authenticationSessionService = injectedAuthenticationSessionService,
  authenticationMethodRepository = injectedAuthenticationMethodRepository,
  oidcAuthenticationServiceRegistry = injectedOidcAuthenticationServiceRegistry,
  userLoginRepository = injectedUserLoginRepository,
  lastUserApplicationConnectionsRepository = injectedLastUserApplicationConnectionsRepository,
  audience,
  requestedApplication,
} = {}) {
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

  const authenticationComplement = oidcAuthenticationService.createAuthenticationComplement({
    userInfo,
    sessionContent,
  });
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
