const encryptionService = require('./encryption-service');
const tokenService = require('./token-service');

async function getUserByUsernameAndPassword({ username, password, userRepository }) {
  const foundUser = await userRepository.getByUsernameOrEmailWithRolesAndPassword(username);
  const passwordHash = foundUser.authenticationMethods[0].authenticationComplement.password;

  await encryptionService.checkPassword({
    password,
    passwordHash,
  });

  return foundUser;
}

async function getPoleEmploiUserInfo(idToken) {
  const { given_name, family_name, nonce, idIdentiteExterne } = await tokenService.extractPayloadFromPoleEmploiIdToken(
    idToken
  );

  return {
    firstName: given_name,
    lastName: family_name,
    externalIdentityId: idIdentiteExterne,
    nonce,
  };
}

module.exports = {
  getPoleEmploiUserInfo,
  getUserByUsernameAndPassword,
};
