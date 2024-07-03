import jsonwebtoken from 'jsonwebtoken';

import { config } from '../../../shared/config.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import * as passwordResetDemandRepository from '../../infrastructure/repositories/reset-password-demand.repository.js';

const generateTemporaryKey = async function () {
  const randomBytesBuffer = await cryptoService.randomBytes(16);
  const base64RandomBytes = randomBytesBuffer.toString('base64');
  return jsonwebtoken.sign(
    {
      data: base64RandomBytes,
    },
    config.temporaryKey.secret,
    { expiresIn: config.temporaryKey.tokenLifespan },
  );
};

const invalidateOldResetPasswordDemand = function (
  userEmail,
  resetPasswordDemandRepository = passwordResetDemandRepository,
) {
  return resetPasswordDemandRepository.markAsBeingUsed(userEmail);
};

const verifyDemand = function (temporaryKey, resetPasswordDemandRepository = passwordResetDemandRepository) {
  return resetPasswordDemandRepository.findByTemporaryKey(temporaryKey).then((fetchedDemand) => fetchedDemand.toJSON());
};

/**
 * @callback hasUserAPasswordResetDemandInProgress
 * @param {string} email
 * @param {string} temporaryKey
 * @param {ResetPasswordDemandRepository} resetPasswordDemandRepository
 * @return {Promise<*>}
 */
const hasUserAPasswordResetDemandInProgress = function (
  email,
  temporaryKey,
  resetPasswordDemandRepository = passwordResetDemandRepository,
) {
  return resetPasswordDemandRepository.findByUserEmail(email, temporaryKey);
};

/**
 * @typedef {Object} ResetPasswordService
 * @property generateTemporaryKey
 * @property hasUserAPasswordResetDemandInProgress
 * @property invalidateOldResetPasswordDemand
 * @property verifyDemand
 */
const resetPasswordService = {
  generateTemporaryKey,
  hasUserAPasswordResetDemandInProgress,
  invalidateOldResetPasswordDemand,
  verifyDemand,
};
export { resetPasswordService };
