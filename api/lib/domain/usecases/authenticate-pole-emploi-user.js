const User = require('../models/User');
const AuthenticationMethod = require('../models/AuthenticationMethod');
const DomainTransaction = require('../../infrastructure/DomainTransaction');
const moment = require('moment');

module.exports = async function authenticatePoleEmploiUser({
  code,
  clientId,
  redirectUri,
  authenticationService,
  tokenService,
  userRepository,
  authenticationMethodRepository,
}) {

  try {
    const poleEmploiTokens = await authenticationService.generatePoleEmploiTokens({ code, clientId, redirectUri });

    const userInfo = await authenticationService.getPoleEmploiUserInfo(poleEmploiTokens.idToken);

    const authenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
      accessToken: poleEmploiTokens.accessToken,
      refreshToken: poleEmploiTokens.refreshToken,
      expiredDate: moment().add(poleEmploiTokens.expiresIn, 's').toDate(),
    });

    let foundUser = await userRepository.findByPoleEmploiExternalIdentifier(userInfo.externalIdentityId);
    if (!foundUser) {

      const user = new User({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        password: '',
        cgu: false,
      });

      await DomainTransaction.execute(async (domainTransaction) => {
        foundUser = await userRepository.create(user, domainTransaction);
        const authenticationMethod = new AuthenticationMethod({
          identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
          userId: foundUser.id,
          externalIdentifier: userInfo.externalIdentityId,
          authenticationComplement,
        });
        await authenticationMethodRepository.create({ authenticationMethod, domainTransaction });
      });
    } else {
      await authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId({ authenticationComplement, userId: foundUser.id });
    }

    const accessToken = tokenService.createAccessTokenFromUser(foundUser, 'pole_emploi_connect');

    return {
      access_token: accessToken,
      id_token: poleEmploiTokens.idToken,
    };
  } catch (error) {
    console.log(error);
  }
};
