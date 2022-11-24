const { PasswordNotMatching } = require('../../errors');
const encryptionService = require('../encryption-service');
const userLoginRepository = require('../../../infrastructure/repositories/user-login-repository');

async function getUserByUsernameAndPassword({ username, password, userRepository }) {
  const foundUser = await userRepository.getByUsernameOrEmailWithRolesAndPassword(username);
  const passwordHash = foundUser.authenticationMethods[0].authenticationComplement.password;

  try {
    await encryptionService.checkPassword({
      password,
      passwordHash,
    });
  } catch (error) {
    if (error instanceof PasswordNotMatching) {
      let userLogin = await userLoginRepository.findByUserId(foundUser.id);
      if (!userLogin) {
        userLogin = await userLoginRepository.create({ userId: foundUser.id });
      }
      userLogin.incrementFailureCount();
      await userLoginRepository.update(userLogin);
    }

    throw error;
  }

  return foundUser;
}

module.exports = {
  getUserByUsernameAndPassword,
};
