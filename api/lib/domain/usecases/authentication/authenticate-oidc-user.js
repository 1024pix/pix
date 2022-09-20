const { UnexpectedOidcStateError, DifferentExternalIdentifierError } = require('../../errors');
const logger = require('../../../infrastructure/logger');
const AuthenticationMethod = require('../../models/AuthenticationMethod');
const config = require('../../../config');

module.exports = async function authenticateOidcUser({
  stateReceived,
  stateSent,
  code,
  redirectUri,
  authenticatedUserId,
  oidcAuthenticationService,
  authenticationSessionService,
  authenticationMethodRepository,
  userRepository,
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

  const userId = user?.id || authenticatedUserId;

  if (!userId) {
    const authenticationKey = await authenticationSessionService.save({ userInfo, sessionContent });
    return { authenticationKey, isAuthenticationComplete: false };
  }

  if (!config.featureToggles.isSsoAccountReconciliationEnabled) {
    await _createOrUpdateAuthenticationMethodWithComplement({
      userInfo,
      userId,
      sessionContent,
      oidcAuthenticationService,
      authenticationMethodRepository,
    });
  } else {
    await _updateAuthenticationMethodWithComplement({
      userInfo,
      userId,
      sessionContent,
      oidcAuthenticationService,
      authenticationMethodRepository,
    });
  }

  const pixAccessToken = oidcAuthenticationService.createAccessToken(userId);
  const logoutUrlUUID = await oidcAuthenticationService.saveIdToken({
    idToken: sessionContent.idToken,
    userId,
  });
  userRepository.updateLastLoggedAt({ userId });

  return { pixAccessToken, logoutUrlUUID, isAuthenticationComplete: true };
};

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

async function _createOrUpdateAuthenticationMethodWithComplement({
  userInfo,
  userId,
  sessionContent,
  oidcAuthenticationService,
  authenticationMethodRepository,
}) {
  const authenticationComplement = oidcAuthenticationService.createAuthenticationComplement({ sessionContent });
  if (!authenticationComplement) return;

  const alreadyExistingAuthenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
    userId,
    identityProvider: oidcAuthenticationService.identityProvider,
  });

  if (!alreadyExistingAuthenticationMethod) {
    return await authenticationMethodRepository.create({
      authenticationMethod: new AuthenticationMethod({
        identityProvider: oidcAuthenticationService.identityProvider,
        userId,
        externalIdentifier: userInfo.externalIdentityId,
        authenticationComplement,
      }),
    });
  }

  if (alreadyExistingAuthenticationMethod.externalIdentifier !== userInfo.externalIdentityId) {
    throw new DifferentExternalIdentifierError();
  }

  return await authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider({
    authenticationComplement,
    userId,
    identityProvider: oidcAuthenticationService.identityProvider,
  });
}
