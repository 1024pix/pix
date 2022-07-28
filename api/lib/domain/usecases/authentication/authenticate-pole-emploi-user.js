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
  oidcAuthenticationService,
  authenticationMethodRepository,
  userRepository,
}) {
  if (stateSent !== stateReceived) {
    logger.error(`State sent ${stateSent} did not match the state received ${stateReceived}`);
    throw new UnexpectedOidcStateError();
  }

  const poleEmploiAuthenticationSessionContent = await oidcAuthenticationService.exchangeCodeForTokens({
    code,
    redirectUri,
  });

  const userInfo = await oidcAuthenticationService.getUserInfo({
    idToken: poleEmploiAuthenticationSessionContent.idToken,
  });

  const authenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
    accessToken: poleEmploiAuthenticationSessionContent.accessToken,
    refreshToken: poleEmploiAuthenticationSessionContent.refreshToken,
    expiredDate: moment().add(poleEmploiAuthenticationSessionContent.expiresIn, 's').toDate(),
  });

  let pixAccessToken;
  let userId = authenticatedUserId;

  if (authenticatedUserId) {
    pixAccessToken = await _getPixAccessTokenFromAlreadyAuthenticatedPixUser({
      userInfo,
      authenticatedUserId,
      authenticationComplement,
      oidcAuthenticationService,
      authenticationMethodRepository,
      userRepository,
    });
  } else {
    const user = await userRepository.findByExternalIdentifier({
      externalIdentityId: userInfo.externalIdentityId,
      identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
    });

    if (!user) {
      const authenticationKey = await authenticationSessionService.save(poleEmploiAuthenticationSessionContent);
      return { authenticationKey };
    } else {
      userId = user.id;
      pixAccessToken = await _getPixAccessTokenFromPoleEmploiUser({
        user,
        authenticationComplement,
        oidcAuthenticationService,
        authenticationMethodRepository,
        userRepository,
      });
    }
  }

  const logoutUrlUUID = await oidcAuthenticationService.saveIdToken({
    idToken: poleEmploiAuthenticationSessionContent.idToken,
    userId,
  });

  return {
    pixAccessToken,
    logoutUrlUUID,
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
  oidcAuthenticationService,
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

  const pixAccessToken = oidcAuthenticationService.createAccessToken(authenticatedUserId);
  await userRepository.updateLastLoggedAt({ userId: authenticatedUserId });
  return pixAccessToken;
}

async function _getPixAccessTokenFromPoleEmploiUser({
  user,
  authenticationComplement,
  oidcAuthenticationService,
  authenticationMethodRepository,
  userRepository,
}) {
  await authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId({
    authenticationComplement,
    userId: user.id,
  });

  const pixAccessToken = oidcAuthenticationService.createAccessToken(user.id);

  await userRepository.updateLastLoggedAt({ userId: user.id });
  return pixAccessToken;
}
