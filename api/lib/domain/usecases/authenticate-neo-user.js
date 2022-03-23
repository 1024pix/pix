const moment = require('moment');

const { UnexpectedNeoStateError, UnexpectedUserAccountError } = require('../errors');
const AuthenticationMethod = require('../models/AuthenticationMethod');
const logger = require('../../infrastructure/logger');

module.exports = async function authenticateNeoUser({
  authenticatedUserId,
  clientId,
  code,
  redirectUri,
  stateReceived,
  stateSent,
  authenticationService,
  tokenService,
  authenticationMethodRepository,
  neoTokensRepository,
  userRepository,
}) {
  if (stateSent !== stateReceived) {
    logger.error(`State sent ${stateSent} did not match the state received ${stateReceived}`);
    throw new UnexpectedNeoStateError();
  }

  const neoTokens = await authenticationService.generateNeoTokens({ code, clientId, redirectUri });
  const userInfo = await authenticationService.getNeoUserInfo(neoTokens.accessToken);

  const authenticationComplement = new AuthenticationMethod.NeoAuthenticationComplement({
    accessToken: neoTokens.accessToken,
    refreshToken: neoTokens.refreshToken,
    expiredDate: moment().add(neoTokens.expiresIn, 's').toDate(),
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
    const user = await userRepository.findByNeoExternalIdentifier(userInfo.externalIdentityId);

    if (!user) {
      const authenticationKey = await neoTokensRepository.save(neoTokens);
      return { authenticationKey }; // todo : refacto, should not return different objects
      // will be refacto when keycloak will be setup
      // this return should be replaced by domain error (see controller)
    } else {
      pixAccessToken = await _getPixAccessTokenFromNeoUser({
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
    neoTokens,
  };
};

function _buildNeoAuthenticationMethod({ userInfo, authenticationComplement, userId }) {
  return new AuthenticationMethod({
    identityProvider: AuthenticationMethod.identityProviders.NEO,
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
    identityProvider: AuthenticationMethod.identityProviders.NEO,
  });

  if (authenticationMethod) {
    if (authenticationMethod.externalIdentifier !== userInfo.externalIdentityId) {
      throw new UnexpectedUserAccountError({ message: "Le compte Pix connecté n'est pas celui qui est attendu." });
    }

    await authenticationMethodRepository.updateNeoAuthenticationComplementByUserId({
      authenticationComplement,
      userId: authenticatedUserId,
    });
  } else {
    const authenticationMethod = _buildNeoAuthenticationMethod({
      userInfo,
      authenticationComplement,
      userId: authenticatedUserId,
    });
    await authenticationMethodRepository.create({ authenticationMethod });
  }
  const pixAccessToken = tokenService.createAccessTokenForNeo(authenticatedUserId);
  await userRepository.updateLastLoggedAt({ userId: authenticatedUserId });
  return pixAccessToken;
}

async function _getPixAccessTokenFromNeoUser({
  user,
  authenticationComplement,
  authenticationMethodRepository,
  userRepository,
  tokenService,
}) {
  await authenticationMethodRepository.updateNeoAuthenticationComplementByUserId({
    authenticationComplement,
    userId: user.id,
  });
  const pixAccessToken = tokenService.createAccessTokenForNeo(user.id);

  await userRepository.updateLastLoggedAt({ userId: user.id });
  return pixAccessToken;
}
