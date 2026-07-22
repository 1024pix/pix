import { config } from '../../../shared/config.js';
import { InvalidTemporaryKeyError } from '../../../shared/domain/errors.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';

const generateTemporaryKey = async function () {
  const randomBytesBuffer = await cryptoService.randomBytes(16);
  const base64RandomBytes = randomBytesBuffer.toString('base64');
  return tokenService.encodeToken(
    { data: base64RandomBytes },
    config.passwordResetDemand.secret,
    config.passwordResetDemand.lifespan,
  );
};

const assertTemporaryKey = function (token) {
  const decoded = tokenService.getDecodedToken(token, config.passwordResetDemand.secret);
  if (!decoded) {
    throw new InvalidTemporaryKeyError();
  }
};

const invalidateOldResetPasswordDemandsByEmail = function (userEmail, resetPasswordDemandRepository) {
  return resetPasswordDemandRepository.markAllAsUsedByEmail(userEmail);
};

const verifyDemand = function (temporaryKey, resetPasswordDemandRepository) {
  return resetPasswordDemandRepository.findByTemporaryKey(temporaryKey);
};

/**
 * @param {string} email
 * @param {string} temporaryKey
 * @param {ResetPasswordDemandRepository} resetPasswordDemandRepository
 * @return {Promise<*>}
 * @throws PasswordResetDemandNotFoundError
 */
const invalidateResetPasswordDemand = function (email, temporaryKey, resetPasswordDemandRepository) {
  return resetPasswordDemandRepository.markAsUsed(email, temporaryKey);
};

/**
 * @typedef {Object} ResetPasswordService
 * @property assertTemporaryKey
 * @property generateTemporaryKey
 * @property invalidateResetPasswordDemand
 * @property invalidateOldResetPasswordDemandsByEmail
 * @property verifyDemand
 */
const resetPasswordService = {
  assertTemporaryKey,
  generateTemporaryKey,
  invalidateResetPasswordDemand,
  invalidateOldResetPasswordDemandsByEmail,
  verifyDemand,
};
export { resetPasswordService };
