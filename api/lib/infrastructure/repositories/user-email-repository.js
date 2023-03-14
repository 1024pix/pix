import { config } from '../../config.js';
const EXPIRATION_DELAY_SECONDS = config.temporaryStorage.expirationDelaySeconds;
import { EmailModificationDemand } from '../../domain/models/EmailModificationDemand.js';
import { temporaryStorage } from '../temporary-storage/index.js';
const verifyEmailTemporaryStorage = temporaryStorage.withPrefix('verify-email:');

const saveEmailModificationDemand = function ({ userId, code, newEmail }) {
  const key = userId;

  return verifyEmailTemporaryStorage.save({
    key,
    value: { code, newEmail },
    expirationDelaySeconds: EXPIRATION_DELAY_SECONDS,
  });
};

const getEmailModificationDemandByUserId = async function (userId) {
  const key = userId;
  const emailModificationDemand = await verifyEmailTemporaryStorage.get(key);

  if (!emailModificationDemand) return;

  return new EmailModificationDemand({
    newEmail: emailModificationDemand.newEmail,
    code: emailModificationDemand.code,
  });
};

export { saveEmailModificationDemand, getEmailModificationDemandByUserId };
