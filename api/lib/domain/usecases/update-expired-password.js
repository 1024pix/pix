const authenticationService = require('../services/authentication-service');
const encryptionService = require('../services/encryption-service');
const { ForbiddenAccess } = require('../../domain/errors');

module.exports = async function updateExpiredPassword({
  username, expiredPassword, newPassword, userRepository,
}) {

  const foundUser = await authenticationService.getUserByUsernameAndPassword({ username, password: expiredPassword, userRepository });

  if (!foundUser.shouldChangePassword) {
    throw new ForbiddenAccess();
  }

  const hashedNewPassword = await encryptionService.hashPassword(newPassword);
  return userRepository.updateExpiredPassword({ userId: foundUser.id, hashedNewPassword });
};
