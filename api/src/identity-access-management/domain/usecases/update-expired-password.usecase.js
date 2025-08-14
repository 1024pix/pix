import lodash from 'lodash';

const { get } = lodash;

import { ForbiddenAccess, UserNotFoundError } from '../../../shared/domain/errors.js';
import { cryptoService as injectedCryptoService } from '../../../shared/domain/services/crypto-service.js';
import { tokenService as injectedTokenService } from '../../../shared/domain/services/token-service.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import * as injectedAuthenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';

const updateExpiredPassword = async function ({
  passwordResetToken,
  newPassword,
  cryptoService = injectedCryptoService,
  tokenService = injectedTokenService,
  authenticationMethodRepository = injectedAuthenticationMethodRepository,
  userRepository = injectedUserRepository,
} = {}) {
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

  await authenticationMethodRepository.updatePassword({
    userId: foundUser.id,
    hashedPassword,
  });

  return foundUser.username ?? foundUser.email;
};

export { updateExpiredPassword };
