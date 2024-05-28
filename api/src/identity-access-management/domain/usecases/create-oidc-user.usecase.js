import { UserAlreadyExistsWithAuthenticationMethodError } from '../../../../lib/domain/errors.js';
import { AuthenticationKeyExpired } from '../errors.js';
import { UserToCreate } from '../models/UserToCreate.js';

/**
 * @typedef {function} createOidcUser
 * @param {Object} params
 * @param {string} params.identityProvider
 * @param {string} params.authenticationKey
 * @param {string} params.localeFromCookie
 * @param {AuthenticationSessionService} params.authenticationSessionService
 * @param {OidcAuthenticationServiceRegistry} params.oidcAuthenticationServiceRegistry
 * @param {AuthenticationMethodRepository} params.authenticationMethodRepository
 * @param {UserToCreateRepository} params.userToCreateRepository
 * @param {UserLoginRepository} params.userLoginRepository
 * @return {Promise<{accessToken: string, logoutUrlUUID: string}>}
 */
async function createOidcUser({
  identityProvider,
  authenticationKey,
  localeFromCookie,
  authenticationSessionService,
  oidcAuthenticationServiceRegistry,
  authenticationMethodRepository,
  userToCreateRepository,
  userLoginRepository,
}) {
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
    locale: localeFromCookie,
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

  const accessToken = oidcAuthenticationService.createAccessToken(userId);

  let logoutUrlUUID;
  if (oidcAuthenticationService.shouldCloseSession) {
    logoutUrlUUID = await oidcAuthenticationService.saveIdToken({ idToken: sessionContent.idToken, userId });
  }

  await userLoginRepository.updateLastLoggedAt({ userId });

  return { accessToken, logoutUrlUUID };
}

export { createOidcUser };
