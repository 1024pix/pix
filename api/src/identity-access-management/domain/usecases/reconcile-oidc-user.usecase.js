import { AlreadyExistingEntityError } from '../../../shared/domain/errors.js';
import { AuthenticationKeyExpired, MissingUserAccountError } from '../errors.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';
import { UserAccessToken } from '../models/UserAccessToken.js';

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
  const sessionContentAndUserInfo = await authenticationSessionService.getByKey(authenticationKey);
  if (!sessionContentAndUserInfo) {
    throw new AuthenticationKeyExpired();
  }

  const { userInfo, sessionContent } = sessionContentAndUserInfo;
  if (!userInfo?.userId) {
    throw new MissingUserAccountError();
  }

  const { userId, externalIdentityId } = userInfo;

  const oidcAuthenticationService = await oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
    requestedApplication,
  });

  const connectionMethodCode = oidcAuthenticationService.connectionMethodCode;
  identityProvider = connectionMethodCode || identityProvider;

  const authenticationComplement = oidcAuthenticationService.createAuthenticationComplement({
    userInfo,
    sessionContent,
  });

  try {
    await authenticationMethodRepository.create({
      authenticationMethod: new AuthenticationMethod({
        identityProvider,
        userId,
        externalIdentifier: externalIdentityId,
        authenticationComplement,
      }),
    });
  } catch (error) {
    if (error instanceof AlreadyExistingEntityError) {
      throw new AlreadyExistingEntityError(
        'Already existing authentication method',
        'SSO_PROVIDER_ALREADY_LINKED_TO_USER',
      );
    }

    throw error;
  }

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
