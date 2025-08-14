import { tokenService as injectedTokenService } from '../../../shared/domain/services/token-service.js';
import { resetPasswordDemandRepository as injectedResetPasswordDemandRepository } from '../../infrastructure/repositories/reset-password-demand.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
import { resetPasswordService as injectedResetPasswordService } from '../services/reset-password.service.js'; /**
 * @typedef {function} getUserByResetPasswordDemandUseCase
 * @param {Object} params
 * @param {string} params.temporaryKey
 * @param {ResetPasswordService} params.resetPasswordService
 * @param {TokenService} params.tokenService
 * @param {UserRepository} params.userRepository
 * @param {resetPasswordDemandRepository} params.resetPasswordDemandRepository
 * @returns {Promise<User|UserNotFoundError>}
 */
export const getUserByResetPasswordDemand = async function ({
  temporaryKey,
  resetPasswordService = injectedResetPasswordService,
  tokenService = injectedTokenService,
  userRepository = injectedUserRepository,
  resetPasswordDemandRepository = injectedResetPasswordDemandRepository,
} = {}) {
  await tokenService.decodeIfValid(temporaryKey);
  const { email } = await resetPasswordService.verifyDemand(temporaryKey, resetPasswordDemandRepository);
  return userRepository.getByEmail(email);
};
