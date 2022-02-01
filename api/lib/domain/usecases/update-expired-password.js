const get = require('lodash/get');

const { ForbiddenAccess } = require('../../domain/errors');

module.exports = async function updateExpiredPassword({
  expiredPassword,
  newPassword,
  username,
  authenticationService,
  encryptionService,
  authenticationMethodRepository,
  userRepository,
}) {
  const foundUser = await authenticationService.getUserByUsernameAndPassword({
    username,
    password: expiredPassword,
    userRepository,
  });

  const shouldChangePassword = get(foundUser, 'authenticationMethods[0].authenticationComplement.shouldChangePassword');

  if (!shouldChangePassword) {
    throw new ForbiddenAccess();
  }

  const hashedPassword = await encryptionService.hashPassword(newPassword);

  return authenticationMethodRepository.updateExpiredPassword({
    userId: foundUser.id,
    hashedPassword,
  });
};
