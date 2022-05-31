const get = require('lodash/get');

const { ForbiddenAccess } = require('../../domain/errors');
const { UserNotFoundError } = require('../../domain/errors');
const logger = require('../../../lib/infrastructure/logger');

module.exports = async function updateExpiredPassword({
  expiredPassword,
  newPassword,
  username,
  pixAuthenticationService,
  encryptionService,
  authenticationMethodRepository,
  userRepository,
}) {
  let foundUser;
  try {
    foundUser = await pixAuthenticationService.getUserByUsernameAndPassword({
      username,
      password: expiredPassword,
      userRepository,
    });
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      logger.warn({ username }, 'Trying to change his password with incorrect username');
    }

    throw error;
  }

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
