const moment = require('moment');

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
  tokenService,
  authenticationMethodRepository,
  cnavTokensRepository,
  userRepository,
}) {
  if (stateSent !== stateReceived) {
    logger.error(`State sent ${stateSent} did not match the state received ${stateReceived}`);
    throw new UnexpectedCnavStateError();
  }
  const cnavTokens = await cnavAuthenticationService.exchangeCodeForTokens({ code, redirectUri });

  const userInfo = await cnavAuthenticationService.getUserInfo(cnavTokens.idToken);

  const authenticationComplement = new AuthenticationMethod.CnavAuthenticationComplement({
    accessToken: cnavTokens.accessToken,
    refreshToken: cnavTokens.refreshToken,
    expiredDate: moment().add(cnavTokens.expiresIn, 's').toDate(),
  });

  let pixAccessToken;

  if (authenticatedUserId) {
    pixAccessToken = await _getPixAccessTokenFromAlreadyAuthenticatedPixUser({
      userInfo,
      authenticatedUserId,
      authenticationComplement,
      authenticationMethodRepository,
      userRepository,
      tokenService,
    });
  } else {
    const user = await userRepository.findByCnavExternalIdentifier(userInfo.externalIdentityId);

    if (!user) {
      const authenticationKey = await cnavTokensRepository.save(cnavTokens);
      return { authenticationKey }; // todo : refacto, should not return different objects
      // will be refacto when keycloak will be setup
      // this return should be replaced by domain error (see controller)
    } else {
      pixAccessToken = await _getPixAccessTokenFromCnavUser({
        user,
        authenticationComplement,
        authenticationMethodRepository,
        userRepository,
        tokenService,
      });
    }
  }

  return {
    pixAccessToken,
    cnavTokens,
  };
};

function _buildCnavAuthenticationMethod({ userInfo, authenticationComplement, userId }) {
  return new AuthenticationMethod({
    identityProvider: AuthenticationMethod.identityProviders.CNAV,
    userId,
    externalIdentifier: userInfo.externalIdentityId,
    authenticationComplement,
  });
}

async function _getPixAccessTokenFromAlreadyAuthenticatedPixUser({
  userInfo,
  authenticatedUserId,
  authenticationComplement,
  authenticationMethodRepository,
  userRepository,
  tokenService,
}) {
  const authenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
    userId: authenticatedUserId,
    identityProvider: AuthenticationMethod.identityProviders.CNAV,
  });

  if (authenticationMethod) {
    if (authenticationMethod.externalIdentifier !== userInfo.externalIdentityId) {
      throw new UnexpectedUserAccountError({ message: "Le compte Pix connecté n'est pas celui qui est attendu." });
    }

    await authenticationMethodRepository.updateCnavAuthenticationComplementByUserId({
      authenticationComplement,
      userId: authenticatedUserId,
    });
  } else {
    const authenticationMethod = _buildCnavAuthenticationMethod({
      userInfo,
      authenticationComplement,
      userId: authenticatedUserId,
    });
    await authenticationMethodRepository.create({ authenticationMethod });
  }
  const pixAccessToken = tokenService.createAccessTokenForCnav(authenticatedUserId);
  await userRepository.updateLastLoggedAt({ userId: authenticatedUserId });
  return pixAccessToken;
}

async function _getPixAccessTokenFromCnavUser({
  user,
  authenticationComplement,
  authenticationMethodRepository,
  userRepository,
  tokenService,
}) {
  await authenticationMethodRepository.updateCnavAuthenticationComplementByUserId({
    authenticationComplement,
    userId: user.id,
  });
  const pixAccessToken = tokenService.createAccessTokenForCnav(user.id);

  await userRepository.updateLastLoggedAt({ userId: user.id });
  return pixAccessToken;
}
