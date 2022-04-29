const { UnexpectedStateError } = require('../errors');
const logger = require('../../infrastructure/logger');

module.exports = async function authenticateCnavUser({
  code,
  redirectUri,
  stateReceived,
  stateSent,
  cnavAuthenticationService,
  authenticationSessionService,
  authenticationMethodRepository,
  userRepository,
}) {
  if (stateSent !== stateReceived) {
    logger.error(`State sent ${stateSent} did not match the state received ${stateReceived}`);
    throw new UnexpectedStateError();
  }
  const idToken = await cnavAuthenticationService.exchangeCodeForIdToken({ code, redirectUri });

  const userInfo = await cnavAuthenticationService.getUserInfo(idToken);

  const user = await userRepository.findByCnavExternalIdentifier(userInfo.externalIdentityId);

  let pixAccessToken;
  if (user) {
    pixAccessToken = await _getPixAccessTokenFromCnavUser({
      user,
      authenticationMethodRepository,
      userRepository,
      cnavAuthenticationService,
    });

    return { pixAccessToken };
  } else {
    const authenticationKey = await authenticationSessionService.save(idToken);

    return { authenticationKey };
  }
};

async function _getPixAccessTokenFromCnavUser({ user, userRepository, cnavAuthenticationService }) {
  const pixAccessToken = cnavAuthenticationService.createAccessToken(user.id);

  await userRepository.updateLastLoggedAt({ userId: user.id });
  return pixAccessToken;
}
