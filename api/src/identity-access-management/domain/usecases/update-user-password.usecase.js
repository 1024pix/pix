import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { UserNotAuthorizedToUpdatePasswordError } from '../../../shared/domain/errors.js';
import { cryptoService as injectedCryptoService } from '../../../shared/domain/services/crypto-service.js';
import * as injectedAuthenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';
import { resetPasswordDemandRepository as injectedResetPasswordDemandRepository } from '../../infrastructure/repositories/reset-password-demand.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
import { resetPasswordService as injectedResetPasswordService } from '../services/reset-password.service.js';

/**
 * @param {{
 *   userId: string,
 *   password: string,
 *   temporaryKey: string,
 *   cryptoService: CryptoService,
 *   resetPasswordService: ResetPasswordService,
 *   authenticationMethodRepository: AuthenticationMethodRepository,
 *   userRepository: UserRepository,
 *   resetPasswordDemandRepository: ResetPasswordDemandRepository,
 * }} params
 * @return {Promise<void>}
 * @throws {UserNotAuthorizedToUpdatePasswordError}
 */
export const updateUserPassword = withTransaction(async function ({
  userId,
  password,
  temporaryKey,
  cryptoService = injectedCryptoService,
  resetPasswordService = injectedResetPasswordService,
  authenticationMethodRepository = injectedAuthenticationMethodRepository,
  userRepository = injectedUserRepository,
  resetPasswordDemandRepository = injectedResetPasswordDemandRepository,
} = {}) {
  const user = await userRepository.get(userId);
  if (!user.email) {
    throw new UserNotAuthorizedToUpdatePasswordError();
  }

  await resetPasswordService.invalidateResetPasswordDemand(user.email, temporaryKey, resetPasswordDemandRepository);

  const hashedPassword = await cryptoService.hashPassword(password);
  await authenticationMethodRepository.updatePassword({
    userId: user.id,
    hashedPassword,
  });

  await resetPasswordService.invalidateOldResetPasswordDemandsByEmail(user.email, resetPasswordDemandRepository);

  await userRepository.updateEmailConfirmed(userId);
});
