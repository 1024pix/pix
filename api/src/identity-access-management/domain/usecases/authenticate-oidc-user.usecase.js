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
  await oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  await oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode(identityProviderCode);

  const oidcAuthenticationService = oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode,
    requestedApplication,
  });

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
    identityProvider: oidcAuthenticationService.identityProvider,
  });

  if (!user) {
    const authenticationKey = await authenticationSessionService.save({ userInfo, sessionContent });

    const userClaims = omit(userInfo, ['externalIdentityId']);

    return {
      authenticationKey,
      userClaims,
      isAuthenticationComplete: false,
      // TODO: The properties givenName and familyName are kept for backward compatibility with the Front. They will be removed soon.
      givenName: userClaims.firstName,
      familyName: userClaims.lastName,
    };
  }

  await _assertUserHasAccessToApplication({ requestedApplication, user, adminMemberRepository });

  const hasConnectionMethodCode = !!oidcAuthenticationService.connectionMethodCode;
  const preferredIdentityProviderName = hasConnectionMethodCode
    ? oidcAuthenticationService.connectionMethodCode
    : oidcAuthenticationService.identityProvider;

  if (hasConnectionMethodCode) {
    await _updateIdentityProviderWithConnectionMethodCodeIfNeeded({
      userId: user.id,
      oidcAuthenticationService,
      authenticationMethodRepository,
    });
  }

  await _updateAuthenticationMethodWithComplement({
    userInfo,
    userId: user.id,
    sessionContent,
    oidcAuthenticationService,
    preferredIdentityProviderName,
    authenticationMethodRepository,
  });

  await _updateUserLastConnection({
    user,
    preferredIdentityProviderName,
    requestedApplication,
    authenticationMethodRepository,
    lastUserApplicationConnectionsRepository,
    userLoginRepository,
  });

  await _updateUserLocaleIfNeeded({ user, locale, userRepository });

  const pixAccessToken = oidcAuthenticationService.createAccessToken({ userId: user.id, audience });

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

async function _updateIdentityProviderWithConnectionMethodCodeIfNeeded({
  userId,
  oidcAuthenticationService,
  authenticationMethodRepository,
}) {
  const { identityProvider, connectionMethodCode } = oidcAuthenticationService;
  await authenticationMethodRepository.updateIdentityProviderByUserIdAndIdentityProvider({
    userId,
    currentIdentityProvider: identityProvider,
    newIdentityProvider: connectionMethodCode,
  });
}

async function _updateAuthenticationMethodWithComplement({
  userInfo,
  userId,
  preferredIdentityProviderName,
  sessionContent,
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
    identityProvider: preferredIdentityProviderName,
  });
}

async function _updateUserLastConnection({
  user,
  preferredIdentityProviderName,
  requestedApplication,
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
    identityProvider: preferredIdentityProviderName,
  });
}
