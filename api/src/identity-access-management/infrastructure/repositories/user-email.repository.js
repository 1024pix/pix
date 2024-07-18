import { temporaryStorage } from '../../../../lib/infrastructure/temporary-storage/index.js';
import { config } from '../../../shared/config.js';
import { EmailModificationDemand } from '../../domain/models/EmailModificationDemand.js';
const verifyEmailTemporaryStorage = temporaryStorage.withPrefix('verify-email:');

const EXPIRATION_DELAY_SECONDS = config.temporaryStorage.expirationDelaySeconds;

/**
 *
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.code
 * @param {string} params.newEmail
 */
const saveEmailModificationDemand = function ({ userId, code, newEmail }) {
  const key = userId;

  return verifyEmailTemporaryStorage.save({
    key,
    value: { code, newEmail },
    expirationDelaySeconds: EXPIRATION_DELAY_SECONDS,
  });
};
/**
 *
 * @param {string} userId
 *
 */
const getEmailModificationDemandByUserId = async function (userId) {
  const key = userId;
  const emailModificationDemand = await verifyEmailTemporaryStorage.get(key);

  if (!emailModificationDemand) return;

  return new EmailModificationDemand({
    newEmail: emailModificationDemand.newEmail,
    code: emailModificationDemand.code,
  });
};
/**
 * @typedef {Object} UserEmailRepository
 * @property {function} saveEmailModificationDemand
 * @property {function} getEmailModificationDemandByUserId
 */
const userEmailRepository = { getEmailModificationDemandByUserId, saveEmailModificationDemand };
export { userEmailRepository };
