import lodash from 'lodash';

import { ForbiddenAccess } from '../../../shared/domain/errors.js';

const { omit } = lodash;

/**
 * @typedef {function} authenticateOidcUser
 * @param {Object} params
 * @param {string} params.target
 * @param {string} params.code
 * @param {string} params.identityProviderCode
 * @param {string} params.nonce
 * @param {string} params.sessionState
 * @param {string} params.state
 * @param {string} params.audience
 * @param {string} params.iss
 * @param {string} params.locale
 * @param {RequestedApplication} params.requestedApplication
 * @param {AuthenticationSessionService} params.authenticationSessionService
 * @param {OidcAuthenticationServiceRegistry} params.oidcAuthenticationServiceRegistry
 * @param {AdminMemberRepository} params.adminMemberRepository
 * @param {AuthenticationMethodRepository} params.authenticationMethodRepository
 * @param {UserLoginRepository} params.userLoginRepository
 * @param {UserRepository} params.userRepository
 * @param {LastUserApplicationConnectionsRepository} params.LastUserApplicationConnectionsRepository,
 * @return {Promise<{isAuthenticationComplete: boolean, givenName: string, familyName: string, authenticationKey: string, email: string}|{isAuthenticationComplete: boolean, pixAccessToken: string, logoutUrlUUID: string}>}
 */
async function authenticateOidcUser({
  code,
  state,
  iss,
  locale,
  identityProviderCode,
  nonce,
  sessionState,
  audience,
  requestedApplication,
  authenticationSessionService,
  oidcAuthenticationServiceRegistry,
  adminMemberRepository,
  authenticationMethodRepository,
  userLoginRepository,
  userRepository,
  lastUserApplicationConnectionsRepository,
}) {
  const oidcAuthenticationService = await oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode,
    requestedApplication,
  });

  const connectionMethodCode = oidcAuthenticationService.connectionMethodCode;
  identityProviderCode = connectionMethodCode || identityProviderCode;

  const sessionContent = await oidcAuthenticationService.exchangeCodeForTokens({
    code,
    state,
    iss,
    nonce,
    sessionState,
  });
  const userInfo = await oidcAuthenticationService.getUserInfo({
    idToken: sessionContent.idToken,
    accessToken: sessionContent.accessToken,
  });
  const user = await userRepository.findByExternalIdentifier({
    externalIdentityId: userInfo.externalIdentityId,
    identityProvider: identityProviderCode,
  });

  if (!user) {
    const authenticationKey = await authenticationSessionService.save({ userInfo, sessionContent });

    const userClaims = omit(userInfo, ['externalIdentityId']);

    return {
      authenticationKey,
      userClaims,
      isAuthenticationComplete: false,
    };
  }

  await _assertUserHasAccessToApplication({ requestedApplication, user, adminMemberRepository });

  await _updateAuthenticationMethodWithComplement({
    userInfo,
    userId: user.id,
    sessionContent,
    identityProvider: identityProviderCode,
    oidcAuthenticationService,
    authenticationMethodRepository,
  });

  await _updateUserLastConnection({
    user,
    requestedApplication,
    identityProvider: identityProviderCode,
    authenticationMethodRepository,
    lastUserApplicationConnectionsRepository,
    userLoginRepository,
  });

  await _updateUserLocaleIfNeeded({ user, locale, userRepository });

  const pixAccessToken = oidcAuthenticationService.createAccessToken({ userId: user.id, audience, sessionId });

  let logoutUrlUUID;
  if (oidcAuthenticationService.shouldCloseSession) {
    logoutUrlUUID = await oidcAuthenticationService.saveIdToken({
      idToken: sessionContent.idToken,
      userId: user.id,
    });
  }

  return { pixAccessToken, logoutUrlUUID, isAuthenticationComplete: true };
}

export { authenticateOidcUser };

async function _updateUserLocaleIfNeeded({ user, locale, userRepository }) {
  const localeChanged = user.changeLocale(locale);
  if (localeChanged) {
    await userRepository.update({ id: user.id, locale: user.locale });
  }
}

async function _assertUserHasAccessToApplication({ requestedApplication, user, adminMemberRepository }) {
  if (requestedApplication.isPixAdmin) {
    const adminMember = await adminMemberRepository.get({ userId: user.id });
    if (!adminMember?.hasAccessToAdminScope) {
      throw new ForbiddenAccess(
        'User does not have the rights to access the application',
        'PIX_ADMIN_ACCESS_NOT_ALLOWED',
      );
    }
  }
}

async function _updateAuthenticationMethodWithComplement({
  userInfo,
  userId,
  sessionContent,
  identityProvider,
  oidcAuthenticationService,
  authenticationMethodRepository,
}) {
  const authenticationComplement = oidcAuthenticationService.createAuthenticationComplement({
    userInfo,
    sessionContent,
  });

  await authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider({
    authenticationComplement,
    userId,
    identityProvider,
  });
}

async function _updateUserLastConnection({
  user,
  requestedApplication,
  identityProvider,
  authenticationMethodRepository,
  lastUserApplicationConnectionsRepository,
  userLoginRepository,
}) {
  await userLoginRepository.updateLastLoggedAt({ userId: user.id });
  await lastUserApplicationConnectionsRepository.upsert({
    userId: user.id,
    application: requestedApplication.applicationName,
    lastLoggedAt: new Date(),
  });
  await authenticationMethodRepository.updateLastLoggedAtByIdentityProvider({
    userId: user.id,
    identityProvider,
  });
}
