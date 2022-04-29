const { UnexpectedCnavStateError, UnexpectedUserAccountError } = require('../errors');
const AuthenticationMethod = require('../models/AuthenticationMethod');
const logger = require('../../infrastructure/logger');

module.exports = async function authenticateCnavUser({
  authenticatedUserId,
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
    // mutualiser cette erreur avec Pole Emploi
    throw new UnexpectedCnavStateError();
  }
  const idToken = await cnavAuthenticationService.exchangeCodeForIdToken({ code, redirectUri });

  const userInfo = await cnavAuthenticationService.getUserInfo(idToken);

  let pixAccessToken;

  if (authenticatedUserId) {
    pixAccessToken = await _getPixAccessTokenFromAlreadyAuthenticatedPixUser({
      userInfo,
      authenticatedUserId,
      authenticationMethodRepository,
      userRepository,
      cnavAuthenticationService,
    });
  } else {
    const user = await userRepository.findByCnavExternalIdentifier(userInfo.externalIdentityId);

    if (!user) {
      const authenticationKey = await authenticationSessionService.save(idToken);
      return { authenticationKey }; // todo : refacto, should not return different objects
      // will be refacto when keycloak will be setup
      // this return should be replaced by domain error (see controller)
    } else {
      pixAccessToken = await _getPixAccessTokenFromCnavUser({
        user,
        authenticationMethodRepository,
        userRepository,
        cnavAuthenticationService,
      });
    }
  }

  return { pixAccessToken };
};

async function _getPixAccessTokenFromAlreadyAuthenticatedPixUser({
  userInfo,
  authenticatedUserId,
  authenticationMethodRepository,
  userRepository,
  cnavAuthenticationService,
}) {
  const authenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
    userId: authenticatedUserId,
    identityProvider: AuthenticationMethod.identityProviders.CNAV,
  });

  if (authenticationMethod) {
    if (authenticationMethod.externalIdentifier !== userInfo.externalIdentityId) {
      throw new UnexpectedUserAccountError({ message: "Le compte Pix connecté n'est pas celui qui est attendu." });
    }
  } else {
    const authenticationMethod = new AuthenticationMethod({
      identityProvider: AuthenticationMethod.identityProviders.CNAV,
      userId: authenticatedUserId,
      externalIdentifier: userInfo.externalIdentityId,
    });
    await authenticationMethodRepository.create({ authenticationMethod });
  }
  const pixAccessToken = cnavAuthenticationService.createAccessToken(authenticatedUserId);
  await userRepository.updateLastLoggedAt({ userId: authenticatedUserId });
  return pixAccessToken;
}

async function _getPixAccessTokenFromCnavUser({ user, userRepository, cnavAuthenticationService }) {
  const pixAccessToken = cnavAuthenticationService.createAccessToken(user.id);

  await userRepository.updateLastLoggedAt({ userId: user.id });
  return pixAccessToken;
}
