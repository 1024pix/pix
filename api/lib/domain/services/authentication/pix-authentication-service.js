const { PasswordNotMatching } = require('../../errors');
const encryptionService = require('../encryption-service');
const userLoginRepository = require('../../../infrastructure/repositories/user-login-repository');

async function getUserByUsernameAndPassword({ username, password, userRepository }) {
  const foundUser = await userRepository.getByUsernameOrEmailWithRolesAndPassword(username);
  const passwordHash = foundUser.authenticationMethods[0].authenticationComplement.password;

  let userLogin = await userLoginRepository.findByUserId(foundUser.id);
  if (!userLogin) {
    userLogin = await userLoginRepository.create({ userId: foundUser.id });
  }

  try {
    await encryptionService.checkPassword({
      password,
      passwordHash,
    });
  } catch (error) {
    if (error instanceof PasswordNotMatching) {
      userLogin.incrementFailureCount();
      userLogin.blockUserTemporarilyWhenFailureCountThresholdReached();
      await userLoginRepository.update(userLogin);
    }

    throw error;
  }

  if (userLogin.hasBeenTemporaryBlocked()) {
    userLogin.resetUserTemporaryBlocking();
    await userLoginRepository.update(userLogin);
  }

  return foundUser;
}

module.exports = {
  getUserByUsernameAndPassword,
};
