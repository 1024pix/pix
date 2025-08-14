import { oidcAuthenticationServiceRegistry as injectedOidcAuthenticationServiceRegistry } from '../../../../lib/domain/usecases/index.js';
import { UserAlreadyExistsWithAuthenticationMethodError } from '../../../shared/domain/errors.js';
import * as injectedUserLoginRepository from '../../../shared/infrastructure/repositories/user-login-repository.js';
import * as injectedAuthenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';
import { lastUserApplicationConnectionsRepository as injectedLastUserApplicationConnectionsRepository } from '../../infrastructure/repositories/last-user-application-connections.repository.js';
import { userToCreateRepository as injectedUserToCreateRepository } from '../../infrastructure/repositories/user-to-create.repository.js';
import { AuthenticationKeyExpired } from '../errors.js';
import { UserToCreate } from '../models/UserToCreate.js';
import { authenticationSessionService as injectedAuthenticationSessionService } from '../services/authentication-session.service.js';

/**
 * @param {{
 *   identityProvider: string,
 *   authenticationKey: string,
 *   locale: string,
 *   language: string,
 *   authenticationSessionService: AuthenticationSessionService,
 *   oidcAuthenticationServiceRegistry: OidcAuthenticationServiceRegistry,
 *   authenticationMethodRepository: AuthenticationMethodRepository,
 *   userToCreateRepository: UserToCreateRepository,
 *   userLoginRepository: UserLoginRepository,
 *   lastUserApplicationConnectionsRepository: LastUserApplicationConnectionsRepository,
 *   requestedApplication: RequestedApplication,
 * }} params
 * @return {Promise<{accessToken: string, logoutUrlUUID: string}>}
 */
async function createOidcUser({
  identityProvider,
  authenticationKey,
  locale,
  language,
  audience,
  authenticationSessionService = injectedAuthenticationSessionService,
  oidcAuthenticationServiceRegistry = injectedOidcAuthenticationServiceRegistry,
  authenticationMethodRepository = injectedAuthenticationMethodRepository,
  userToCreateRepository = injectedUserToCreateRepository,
  userLoginRepository = injectedUserLoginRepository,
  lastUserApplicationConnectionsRepository = injectedLastUserApplicationConnectionsRepository,
  requestedApplication,
} = {}) {
  const sessionContentAndUserInfo = await authenticationSessionService.getByKey(authenticationKey);
  if (!sessionContentAndUserInfo) {
    throw new AuthenticationKeyExpired();
  }

  const { userInfo, sessionContent } = sessionContentAndUserInfo;

  const authenticationMethod = await authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider({
    externalIdentifier: userInfo.externalIdentityId,
    identityProvider,
  });

  if (authenticationMethod) {
    throw new UserAlreadyExistsWithAuthenticationMethodError(
      'Authentication method already exists for this external identifier.',
    );
  }

  const user = UserToCreate.createWithTermsOfServiceAccepted({
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
    locale: locale,
    lang: language,
  });

  await oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  await oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode(identityProvider);

  const oidcAuthenticationService = oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
  });

  const userId = await oidcAuthenticationService.createUserAccount({
    user,
    userInfo,
    sessionContent,
    externalIdentityId: userInfo.externalIdentityId,
    userToCreateRepository,
    authenticationMethodRepository,
  });

  await _updateUserLastConnection({
    userId,
    requestedApplication,
    oidcAuthenticationService,
    authenticationMethodRepository,
    lastUserApplicationConnectionsRepository,
    userLoginRepository,
  });

  const accessToken = oidcAuthenticationService.createAccessToken({ userId, audience });

  let logoutUrlUUID;
  if (oidcAuthenticationService.shouldCloseSession) {
    logoutUrlUUID = await oidcAuthenticationService.saveIdToken({ idToken: sessionContent.idToken, userId });
  }

  return { accessToken, logoutUrlUUID };
}

export { createOidcUser };

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
