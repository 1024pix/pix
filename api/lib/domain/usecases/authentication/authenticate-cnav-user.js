const { UnexpectedOidcStateError } = require('../../errors');
const AuthenticationMethod = require('../../models/AuthenticationMethod');
const logger = require('../../../infrastructure/logger');

module.exports = async function authenticateCnavUser({
  code,
  redirectUri,
  stateReceived,
  stateSent,
  oidcAuthenticationService,
  authenticationSessionService,
  userRepository,
}) {
  if (stateSent !== stateReceived) {
    logger.error(`State sent ${stateSent} did not match the state received ${stateReceived}`);
    throw new UnexpectedOidcStateError();
  }
  const { idToken } = await oidcAuthenticationService.exchangeCodeForTokens({ code, redirectUri });

  const userInfo = await oidcAuthenticationService.getUserInfo({ idToken });

  const user = await userRepository.findByExternalIdentifier({
    externalIdentityId: userInfo.externalIdentityId,
    identityProvider: AuthenticationMethod.identityProviders.CNAV,
  });

  if (user) {
    const pixAccessToken = oidcAuthenticationService.createAccessToken(user.id);

    await userRepository.updateLastLoggedAt({ userId: user.id });

    return { pixAccessToken, isAuthenticationComplete: true };
  } else {
    const authenticationKey = await authenticationSessionService.save({ idToken });

    return { authenticationKey, isAuthenticationComplete: false };
  }
};
