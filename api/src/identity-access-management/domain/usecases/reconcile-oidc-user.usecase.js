import { AuthenticationKeyExpired, MissingUserAccountError } from '../errors.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';

/**
 * @typedef {function} reconcileOidcUserUseCase
 * @param {Object} params
 * @param {string} params.authenticationKey
 * @param {string} params.identityProvider
 * @param {AuthenticationSessionService} params.authenticationSessionService
 * @param {AuthenticationMethodRepository} params.authenticationMethodRepository
 * @param {OidcAuthenticationServiceRegistry} params.oidcAuthenticationServiceRegistry
 * @param {UserLoginRepository} params.userLoginRepository
 * @return {Promise<{accessToken: string, logoutUrlUUID: string}|AuthenticationKeyExpired|MissingUserAccountError>}
 */
export const reconcileOidcUser = async function ({
  authenticationKey,
  identityProvider,
  authenticationSessionService,
  authenticationMethodRepository,
  oidcAuthenticationServiceRegistry,
  userLoginRepository,
}) {
  await oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  await oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode(identityProvider);

  const oidcAuthenticationService = oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
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

  const accessToken = await oidcAuthenticationService.createAccessToken(userId);

  let logoutUrlUUID;
  if (oidcAuthenticationService.shouldCloseSession) {
    logoutUrlUUID = await oidcAuthenticationService.saveIdToken({
      idToken: sessionContent.idToken,
      userId,
    });
  }

  await userLoginRepository.updateLastLoggedAt({ userId });

  return { accessToken, logoutUrlUUID };
};
