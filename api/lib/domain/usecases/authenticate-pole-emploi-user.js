const User = require('../models/User');

module.exports = async function authenticatePoleEmploiUser({
  code,
  clientId,
  redirectUri,
  authenticationService,
  tokenService,
  userRepository,
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
    user.externalIdentityId = userInfo.externalIdentityId;

    let foundUser = await userRepository.findByExternalIdentityId(user.externalIdentityId);
    if (!foundUser) {
      foundUser = await userRepository.create(user);
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
