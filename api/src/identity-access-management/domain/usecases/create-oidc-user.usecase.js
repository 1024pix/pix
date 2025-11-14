import { UserAlreadyExistsWithAuthenticationMethodError } from '../../../shared/domain/errors.js';
import { AuthenticationKeyExpired } from '../errors.js';
import { UserToCreate } from '../models/UserToCreate.js';

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
  authenticationSessionService,
  oidcAuthenticationServiceRegistry,
  authenticationMethodRepository,
  userToCreateRepository,
  userLoginRepository,
  lastUserApplicationConnectionsRepository,
  requestedApplication,
}) {
  const sessionContentAndUserInfo = await authenticationSessionService.getByKey(authenticationKey);
  if (!sessionContentAndUserInfo) {
    throw new AuthenticationKeyExpired();
  }

  const { userInfo, sessionContent } = sessionContentAndUserInfo;

  await oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  await oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode(identityProvider);

  const oidcAuthenticationService = oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
    requestedApplication,
  });

  const identityProviders = [
    oidcAuthenticationService.connectionMethodCode,
    oidcAuthenticationService.identityProvider,
  ].filter(Boolean);

  const hasAlreadyAuthenticationMethod =
    await authenticationMethodRepository.hasAuthenticationMethodForAnyOfTheseIdentityProviders({
      externalIdentifier: userInfo.externalIdentityId,
      identityProviders,
    });

  if (hasAlreadyAuthenticationMethod) {
    throw new UserAlreadyExistsWithAuthenticationMethodError(
      'Authentication method already exists for this external identifier.',
    );
  }

  const user = UserToCreate.createWithTermsOfServiceAccepted({
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
    locale,
    lang: language,
  });

  const hasConnectionMethodCode = !!oidcAuthenticationService.connectionMethodCode;
  const preferredIdentityProviderName = hasConnectionMethodCode
    ? oidcAuthenticationService.connectionMethodCode
    : oidcAuthenticationService.identityProvider;

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
    preferredIdentityProviderName,
    requestedApplication,
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
  preferredIdentityProviderName,
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
    identityProvider: preferredIdentityProviderName,
  });
}
