import settings from '../../config';
const EXPIRATION_DELAY_SECONDS = settings.temporaryStorage.expirationDelaySeconds;
import EmailModificationDemand from '../../domain/models/EmailModificationDemand';
const temporaryStorage = require('../temporary-storage').withPrefix('verify-email:');

export default {
  saveEmailModificationDemand({ userId, code, newEmail }) {
    const key = userId;

    return temporaryStorage.save({
      key,
      value: { code, newEmail },
      expirationDelaySeconds: EXPIRATION_DELAY_SECONDS,
    });
  },

  async getEmailModificationDemandByUserId(userId) {
    const key = userId;
    const emailModificationDemand = await temporaryStorage.get(key);

    if (!emailModificationDemand) return;

    return new EmailModificationDemand({
      newEmail: emailModificationDemand.newEmail,
      code: emailModificationDemand.code,
    });
  },
};
