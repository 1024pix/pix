const User = require('../models/User');
const AuthenticationMethod = require('../models/AuthenticationMethod');
const { UnexpectedUserAccount } = require('../errors');
const DomainTransaction = require('../../infrastructure/DomainTransaction');
const moment = require('moment');

module.exports = async function authenticatePoleEmploiUser({
  code,
  clientId,
  redirectUri,
  authenticatedUserId,
  authenticationService,
  tokenService,
  userRepository,
  authenticationMethodRepository,
}) {

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
        throw new UnexpectedUserAccount({ message: 'Le compte Pix connecté n\'est pas celui qui est attendu.' });
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
      const user = new User({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        cgu: false,
      });

      let createdUserId;
      await DomainTransaction.execute(async (domainTransaction) => {
        createdUserId = (await userRepository.create({ user, domainTransaction })).id;

        const authenticationMethod = _buildPoleEmploiAuthenticationMethod({ userInfo, authenticationComplement, userId: createdUserId });
        await authenticationMethodRepository.create({ authenticationMethod, domainTransaction });
      });

      accessToken = tokenService.createAccessTokenFromUser(createdUserId, 'pole_emploi_connect');

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
