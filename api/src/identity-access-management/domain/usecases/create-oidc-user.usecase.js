import { UserAlreadyExistsWithAuthenticationMethodError } from '../../../shared/domain/errors.js';
import { AuthenticationKeyExpired } from '../errors.js';
import { UserAccessToken } from '../models/UserAccessToken.js';
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
  legalDocumentApiRepository,
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

  const oidcAuthenticationService = await oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
    requestedApplication,
  });

  const connectionMethodCode = oidcAuthenticationService.connectionMethodCode;
  identityProvider = connectionMethodCode || identityProvider;

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
    locale,
    lang: language,
  });

  const userId = await oidcAuthenticationService.createUserAccount({
    user,
    userInfo,
    sessionContent,
    externalIdentityId: userInfo.externalIdentityId,
    userToCreateRepository,
    authenticationMethodRepository,
  });

  await legalDocumentApiRepository.acceptPixAppTos({ userId });

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

  const { accessToken } = UserAccessToken.generateOidcUserToken({
    userId,
    audience,
    sessionId,
    expiresIn,
  });

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
