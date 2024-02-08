import { UnexpectedOidcStateError } from '../../errors.js';
import { logger } from '../../../infrastructure/logger.js';

const authenticateOidcUser = async function ({
  stateReceived,
  stateSent,
  code,
  redirectUri,
  oidcAuthenticationService,
  authenticationSessionService,
  authenticationMethodRepository,
  userRepository,
  userLoginRepository,
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
