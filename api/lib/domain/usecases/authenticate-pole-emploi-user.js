const moment = require('moment');

const {
  UnexpectedPoleEmploiStateError,
  UnexpectedUserAccountError,
  UserAccountNotFoundForPoleEmploiError,
} = require('../errors');
const AuthenticationMethod = require('../models/AuthenticationMethod');
const logger = require('../../infrastructure/logger');

module.exports = async function authenticatePoleEmploiUser({
  authenticatedUserId,
  clientId,
  code,
  redirectUri,
  stateReceived,
  stateSent,
  authenticationService,
  tokenService,
  authenticationMethodRepository,
  poleEmploiTokensRepository,
  userRepository,
}) {
  if (stateSent !== stateReceived) {
    logger.error(`State sent ${stateSent} did not match the state received ${stateReceived}`);
    throw new UnexpectedPoleEmploiStateError();
  }

  const poleEmploiTokens = await authenticationService.generatePoleEmploiTokens({ code, clientId, redirectUri });

  const userInfo = await authenticationService.getPoleEmploiUserInfo(poleEmploiTokens.idToken);

  const authenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
    accessToken: poleEmploiTokens.accessToken,
    refreshToken: poleEmploiTokens.refreshToken,
    expiredDate: moment().add(poleEmploiTokens.expiresIn, 's').toDate(),
  });

  let accessToken;

  if (authenticatedUserId) {
    const authenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({ userId: authenticatedUserId, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI });

    if (authenticationMethod) {
      if (authenticationMethod.externalIdentifier !== userInfo.externalIdentityId) {
        throw new UnexpectedUserAccountError({ message: 'Le compte Pix connecté n\'est pas celui qui est attendu.' });
      }

      await authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId({ authenticationComplement, userId: authenticatedUserId });

    } else {
      const authenticationMethod = _buildPoleEmploiAuthenticationMethod({ userInfo, authenticationComplement, userId: authenticatedUserId });
      await authenticationMethodRepository.create({ authenticationMethod });
    }

    accessToken = tokenService.createAccessTokenFromUser(authenticatedUserId, 'pole_emploi_connect');

  } else {
    const user = await userRepository.findByPoleEmploiExternalIdentifier(userInfo.externalIdentityId);

    if (!user) {
      const responseCode = 'SHOULD_VALIDATE_CGU';
      const message = 'L\'utilisateur n\'a pas de compte Pix';

      const authenticationKey = await poleEmploiTokensRepository.save(poleEmploiTokens);

      throw new UserAccountNotFoundForPoleEmploiError({
        message, responseCode, authenticationKey,
      });
    } else {
      await authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId({ authenticationComplement, userId: user.id });
      accessToken = tokenService.createAccessTokenFromUser(user.id, 'pole_emploi_connect');
    }
  }

  return {
    access_token: accessToken,
    id_token: poleEmploiTokens.idToken,
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
