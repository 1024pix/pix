import lodash from 'lodash';

const { get } = lodash;

import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../src/identity-access-management/domain/constants/identity-providers.js';
import { ForbiddenAccess } from '../../../src/shared/domain/errors.js';
import { logger } from '../../../src/shared/infrastructure/utils/logger.js';
import { UserNotFoundError } from '../../domain/errors.js';

const updateExpiredPassword = async function ({
  passwordResetToken,
  newPassword,
  cryptoService,
  tokenService,
  authenticationMethodRepository,
  userRepository,
}) {
  const userId = await tokenService.extractUserId(passwordResetToken);

  let foundUser;
  try {
    foundUser = await userRepository.get(userId);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      logger.warn('Trying to change his password with incorrect user id');
    }
    throw error;
  }

  const authenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
    userId: foundUser.id,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
  });

  const shouldChangePassword = get(authenticationMethod, 'authenticationComplement.shouldChangePassword');

  if (!shouldChangePassword) {
    throw new ForbiddenAccess();
  }

  const hashedPassword = await cryptoService.hashPassword(newPassword);

  await authenticationMethodRepository.updateExpiredPassword({
    userId: foundUser.id,
    hashedPassword,
  });

  return foundUser.username ?? foundUser.email;
};

export { updateExpiredPassword };
