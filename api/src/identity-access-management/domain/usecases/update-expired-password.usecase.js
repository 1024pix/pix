import lodash from 'lodash';

const { get } = lodash;

import { ForbiddenAccess, UserNotFoundError } from '../../../shared/domain/errors.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import { PasswordResetTokenInvalidOrExpired } from '../errors.js';
import { PasswordExpirationToken } from '../models/PasswordExpirationToken.js';

/**
 * @param {Object} params
 * @param {string} params.passwordExpirationToken - The token containing password expiration info
 * @param {string} params.newPassword - The new password to set
 * @param {CryptoService} params.cryptoService - Service for password hashing
 * @param {AuthenticationMethodRepository} params.authenticationMethodRepository
 * @param {UserRepository} params.userRepository
 * @returns {Promise<string>} The user's username or email
 * @throws {PasswordResetTokenInvalidOrExpired} If token is invalid or expired
 * @throws {UserNotFoundError} If user is not found
 * @throws {ForbiddenAccess} If user is not authorized to change password
 */
const updateExpiredPassword = async function ({
  passwordExpirationToken,
  newPassword,
  cryptoService,
  authenticationMethodRepository,
  userRepository,
}) {
  const { userId } = PasswordExpirationToken.decode(passwordExpirationToken);
  if (!userId) {
    throw new PasswordResetTokenInvalidOrExpired();
  }

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

  await authenticationMethodRepository.updatePassword({
    userId: foundUser.id,
    hashedPassword,
  });

  return foundUser.username ?? foundUser.email;
};

export { updateExpiredPassword };
