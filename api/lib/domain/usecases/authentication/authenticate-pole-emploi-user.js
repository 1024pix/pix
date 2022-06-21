const moment = require('moment');

const { UnexpectedOidcStateError, UnexpectedUserAccountError } = require('../../errors');
const AuthenticationMethod = require('../../models/AuthenticationMethod');
const logger = require('../../../infrastructure/logger');

module.exports = async function authenticatePoleEmploiUser({
  authenticatedUserId,
  code,
  redirectUri,
  stateReceived,
  stateSent,
  authenticationSessionService,
  poleEmploiAuthenticationService,
  authenticationMethodRepository,
  userRepository,
}) {
  if (stateSent !== stateReceived) {
    logger.error(`State sent ${stateSent} did not match the state received ${stateReceived}`);
    throw new UnexpectedOidcStateError();
  }

  const poleEmploiTokens = await poleEmploiAuthenticationService.exchangeCodeForTokens({ code, redirectUri });

  const userInfo = await poleEmploiAuthenticationService.getUserInfo({ idToken: poleEmploiTokens.idToken });

  const authenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
    accessToken: poleEmploiTokens.accessToken,
    refreshToken: poleEmploiTokens.refreshToken,
    expiredDate: moment().add(poleEmploiTokens.expiresIn, 's').toDate(),
  });

  let pixAccessToken;

  if (authenticatedUserId) {
    pixAccessToken = await _getPixAccessTokenFromAlreadyAuthenticatedPixUser({
      userInfo,
      authenticatedUserId,
      authenticationComplement,
      poleEmploiAuthenticationService,
      authenticationMethodRepository,
      userRepository,
    });
  } else {
    const user = await userRepository.findByExternalIdentifier({
      externalIdentityId: userInfo.externalIdentityId,
      identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
    });

    if (!user) {
      const authenticationKey = await authenticationSessionService.save(poleEmploiTokens);
      return { authenticationKey }; // todo : refacto, should not return different objects
      // will be refacto when keycloak will be setup
      // this return should be replaced by domain error (see controller)
    } else {
      pixAccessToken = await _getPixAccessTokenFromPoleEmploiUser({
        user,
        authenticationComplement,
        poleEmploiAuthenticationService,
        authenticationMethodRepository,
        userRepository,
      });
    }
  }

  return {
    pixAccessToken,
    poleEmploiTokens,
  };
};

function _buildPoleEmploiAuthenticationMethod({ userInfo, authenticationComplement, userId }) {
  return new AuthenticationMethod({
    identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
    userId,
    externalIdentifier: userInfo.externalIdentityId,
    authenticationComplement,
  });
}

async function _getPixAccessTokenFromAlreadyAuthenticatedPixUser({
  userInfo,
  authenticatedUserId,
  authenticationComplement,
  poleEmploiAuthenticationService,
  authenticationMethodRepository,
  userRepository,
}) {
  const authenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
    userId: authenticatedUserId,
    identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
  });

  if (authenticationMethod) {
    if (authenticationMethod.externalIdentifier !== userInfo.externalIdentityId) {
      throw new UnexpectedUserAccountError({ message: "Le compte Pix connecté n'est pas celui qui est attendu." });
    }

    await authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId({
      authenticationComplement,
      userId: authenticatedUserId,
    });
  } else {
    const authenticationMethod = _buildPoleEmploiAuthenticationMethod({
      userInfo,
      authenticationComplement,
      userId: authenticatedUserId,
    });
    await authenticationMethodRepository.create({ authenticationMethod });
  }
  const pixAccessToken = poleEmploiAuthenticationService.createAccessToken(authenticatedUserId);
  await userRepository.updateLastLoggedAt({ userId: authenticatedUserId });
  return pixAccessToken;
}

async function _getPixAccessTokenFromPoleEmploiUser({
  user,
  authenticationComplement,
  poleEmploiAuthenticationService,
  authenticationMethodRepository,
  userRepository,
}) {
  await authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId({
    authenticationComplement,
    userId: user.id,
  });
  const pixAccessToken = poleEmploiAuthenticationService.createAccessToken(user.id);

  await userRepository.updateLastLoggedAt({ userId: user.id });
  return pixAccessToken;
}
