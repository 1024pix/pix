import { config } from '../../../../config/config.js';
import { temporaryStorage } from '../../../shared/infrastructure/key-value-storages/index.js';
import { EmailModificationDemand } from '../../domain/models/EmailModificationDemand.js';
const verifyEmailTemporaryStorage = temporaryStorage.withPrefix('verify-email:');

const EXPIRATION_DELAY_SECONDS = config.temporaryStorageForEmailValidationCode.expirationDelaySeconds;

/**
 *
 * @param {Object} params
 * @param {string} params.userId
 * @param {'update-email'|'add-email'} params.action
 * @param {string} params.code
 * @param {string} params.newEmail
 * @param {string} params.passwordHash
 */
const saveEmailModificationDemand = function ({ userId, action, code, newEmail, passwordHash }) {
  const key = userId;

  return verifyEmailTemporaryStorage.save({
    key,
    value: { action, code, newEmail, passwordHash },
    expirationDelaySeconds: EXPIRATION_DELAY_SECONDS,
  });
};
/**
 * @param {string} userId
 */
const getEmailModificationDemandByUserId = async function (userId) {
  const key = userId;
  const emailModificationDemand = await verifyEmailTemporaryStorage.get(key);

  if (!emailModificationDemand) return;

  return new EmailModificationDemand({
    newEmail: emailModificationDemand.newEmail,
    code: emailModificationDemand.code,
    action: emailModificationDemand.action,
    password: emailModificationDemand.passwordHash,
  });
};
/**
 * @param {string} userId
 */
const deleteEmailModificationDemandByUserId = function (userId) {
  return verifyEmailTemporaryStorage.delete(userId);
};

/**
 * @typedef {Object} UserEmailRepository
 * @property {function} saveEmailModificationDemand
 * @property {function} getEmailModificationDemandByUserId
 */

const userEmailRepository = {
  getEmailModificationDemandByUserId,
  saveEmailModificationDemand,
  deleteEmailModificationDemandByUserId,
};
export { userEmailRepository };
