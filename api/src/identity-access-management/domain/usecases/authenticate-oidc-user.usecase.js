import { PIX_ADMIN } from '../../../authorization/domain/constants.js';
import { ForbiddenAccess } from '../../../shared/domain/errors.js';

/**
 * @typedef {function} authenticateOidcUser
 * @param {Object} params
 * @param {string} params.sessionState
 * @param {string} params.state
 * @param {string} params.code
 * @param {string} params.redirectUri
 * @param {string} params.nonce
 * @param {string} params.audience
 * @param params.oidcAuthenticationService
 * @param {AuthenticationSessionService} params.authenticationSessionService
 * @param {AuthenticationMethodRepository} params.authenticationMethodRepository
 * @param {UserRepository} params.userRepository
 * @param {UserLoginRepository} params.userLoginRepository
 * @param {AdminMemberRepository} params.adminMemberRepository
 * @return {Promise<{isAuthenticationComplete: boolean, givenName: string, familyName: string, authenticationKey: string, email: string}|{isAuthenticationComplete: boolean, pixAccessToken: string, logoutUrlUUID: string}>}
 */
async function authenticateOidcUser({
  sessionState,
  state,
  code,
  redirectUri,
  nonce,
  audience,
  oidcAuthenticationService,
  authenticationSessionService,
  authenticationMethodRepository,
  userRepository,
  userLoginRepository,
  adminMemberRepository,
}) {
  const sessionContent = await oidcAuthenticationService.exchangeCodeForTokens({
    code,
    redirectUri,
    nonce,
    sessionState,
    state,
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
    const { firstName: givenName, lastName: familyName, email } = userInfo;
    return { authenticationKey, givenName, familyName, email, isAuthenticationComplete: false };
  }

  await _assertUserWithPixAdminAccess({ audience, userId: user.id, adminMemberRepository });

  await _updateAuthenticationMethodWithComplement({
    userInfo,
    userId: user.id,
    sessionContent,
    oidcAuthenticationService,
    authenticationMethodRepository,
  });

  const pixAccessToken = oidcAuthenticationService.createAccessToken(user.id);

  let logoutUrlUUID;
  if (oidcAuthenticationService.shouldCloseSession) {
    logoutUrlUUID = await oidcAuthenticationService.saveIdToken({
      idToken: sessionContent.idToken,
      userId: user.id,
    });
  }

  await userLoginRepository.updateLastLoggedAt({ userId: user.id });

  return { pixAccessToken, logoutUrlUUID, isAuthenticationComplete: true };
}

export { authenticateOidcUser };

async function _updateAuthenticationMethodWithComplement({
  userInfo,
  userId,
  sessionContent,
  oidcAuthenticationService,
  authenticationMethodRepository,
}) {
  const authenticationComplement = oidcAuthenticationService.createAuthenticationComplement({
    userInfo,
    sessionContent,
  });

  return await authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider({
    authenticationComplement,
    userId,
    identityProvider: oidcAuthenticationService.identityProvider,
  });
}

async function _assertUserWithPixAdminAccess({ audience, userId, adminMemberRepository }) {
  if (audience === PIX_ADMIN.AUDIENCE) {
    const adminMember = await adminMemberRepository.get({ userId });
    if (!adminMember?.hasAccessToAdminScope) {
      throw new ForbiddenAccess(
        'User does not have the rights to access the application',
        'PIX_ADMIN_ACCESS_NOT_ALLOWED',
      );
    }
  }
}
