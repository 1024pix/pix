import { UnexpectedOidcStateError } from '../../errors.js';
import { ForbiddenAccess } from '../../../../src/shared/domain/errors.js';
import { logger } from '../../../infrastructure/logger.js';
import { PIX_ADMIN } from '../../constants.js';

const authenticateOidcUser = async function ({
  stateReceived,
  stateSent,
  code,
  redirectUri,
  source,
  oidcAuthenticationService,
  authenticationSessionService,
  authenticationMethodRepository,
  userRepository,
  userLoginRepository,
  adminMemberRepository,
}) {
  if (stateSent !== stateReceived) {
    logger.error(`State sent ${stateSent} did not match the state received ${stateReceived}`);
    throw new UnexpectedOidcStateError();
  }

  const sessionContent = await oidcAuthenticationService.exchangeCodeForTokens({ code, redirectUri });
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
    const { firstName: givenName, lastName: familyName } = userInfo;
    return { authenticationKey, givenName, familyName, isAuthenticationComplete: false };
  }

  await _checkUserAccessScope({ source, user, adminMemberRepository });

  await _updateAuthenticationMethodWithComplement({
    userInfo,
    userId: user.id,
    sessionContent,
    oidcAuthenticationService,
    authenticationMethodRepository,
  });

  const pixAccessToken = oidcAuthenticationService.createAccessToken(user.id);
  const logoutUrlUUID = await oidcAuthenticationService.saveIdToken({
    idToken: sessionContent.idToken,
    userId: user.id,
  });

  await userLoginRepository.updateLastLoggedAt({ userId: user.id });

  return { pixAccessToken, logoutUrlUUID, isAuthenticationComplete: true };
};

export { authenticateOidcUser };

async function _updateAuthenticationMethodWithComplement({
  userId,
  sessionContent,
  oidcAuthenticationService,
  authenticationMethodRepository,
}) {
  const authenticationComplement = oidcAuthenticationService.createAuthenticationComplement({ sessionContent });
  if (!authenticationComplement) return;

  return await authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider({
    authenticationComplement,
    userId,
    identityProvider: oidcAuthenticationService.identityProvider,
  });
}

async function _checkUserAccessScope({ source, user, adminMemberRepository }) {
  if (source === PIX_ADMIN.SCOPE) {
    const adminMember = await adminMemberRepository.get({ userId: user.id });
    if (!adminMember?.hasAccessToAdminScope) {
      throw new ForbiddenAccess(
        'User does not have the rights to access the application',
        'PIX_ADMIN_ACCESS_NOT_ALLOWED',
      );
    }
  }
}
