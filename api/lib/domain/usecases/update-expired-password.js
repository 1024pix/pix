import lodash from 'lodash';

const { get } = lodash;

import { AuthenticationMethod } from '../../domain/models/AuthenticationMethod.js';
import { ForbiddenAccess, UserNotFoundError } from '../../domain/errors.js';
import { logger } from '../../../lib/infrastructure/logger.js';

const updateExpiredPassword = async function ({
  passwordResetToken,
  newPassword,
  encryptionService,
  tokenService,
  authenticationMethodRepository,
  userRepository,
}) {
  const userId = await tokenService.extractUserId(passwordResetToken);

  let foundUser;
  try {
    foundUser = await userRepository.getById(userId);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      logger.warn('Trying to change his password with incorrect user id');
    }
    throw error;
  }

  const authenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
    userId: foundUser.id,
    identityProvider: AuthenticationMethod.identityProviders.PIX,
  });

  const shouldChangePassword = get(authenticationMethod, 'authenticationComplement.shouldChangePassword');

  if (!shouldChangePassword) {
    throw new ForbiddenAccess();
  }

  const hashedPassword = await encryptionService.hashPassword(newPassword);

  await authenticationMethodRepository.updateExpiredPassword({
    userId: foundUser.id,
    hashedPassword,
  });

  return foundUser.username ?? foundUser.email;
};

export { updateExpiredPassword };
