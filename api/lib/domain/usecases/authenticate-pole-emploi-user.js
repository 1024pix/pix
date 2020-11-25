const User = require('../models/User');
const AuthenticationMethod = require('../models/AuthenticationMethod');
const DomainTransaction = require('../../infrastructure/DomainTransaction');

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
    const poleEmploiTokens = await authenticationService.generateAccessToken({ code, clientId, redirectUri });

    const userInfo = await authenticationService.getPoleEmploiUserInfo(poleEmploiTokens.idToken);

    const user = new User({
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      password: '',
      cgu: false,
    });

    let foundUser = await userRepository.findByExternalIdentityId(userInfo.externalIdentityId);
    if (!foundUser) {
      await DomainTransaction.execute(async (domainTransaction) => {
        foundUser = await userRepository.create(user, domainTransaction);

        const authenticationMethod = new AuthenticationMethod({
          identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
          userId: foundUser.id,
          externalIdentifier: userInfo.externalIdentityId,
        });
        await authenticationMethodRepository.create({ authenticationMethod, domainTransaction });
      });
    }

    const accessToken = tokenService.createAccessTokenFromUser(foundUser, 'external');

    return {
      access_token: accessToken,
      id_token: poleEmploiTokens.idToken,
    };
  } catch (error) {
    console.log(error);
  }
};
