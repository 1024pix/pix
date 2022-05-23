const encryptionService = require('../encryption-service');

async function getUserByUsernameAndPassword({ username, password, userRepository }) {
  const foundUser = await userRepository.getByUsernameOrEmailWithRolesAndPassword(username);
  const passwordHash = foundUser.authenticationMethods[0].authenticationComplement.password;

  await encryptionService.checkPassword({
    password,
    passwordHash,
  });

  return foundUser;
}

module.exports = {
  getUserByUsernameAndPassword,
};
