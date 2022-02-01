const settings = require('../../config');
const temporaryStorage = require('../temporary-storage');
const EXPIRATION_DELAY_SECONDS = settings.temporaryStorage.expirationDelaySeconds;
const EmailModificationDemand = require('../../domain/models/EmailModificationDemand');

module.exports = {
  saveEmailModificationDemand({ userId, code, newEmail }) {
    const key = 'VERIFY-EMAIL-' + userId;

    return temporaryStorage.save({
      key,
      value: { code, newEmail },
      expirationDelaySeconds: EXPIRATION_DELAY_SECONDS,
    });
  },

  async getEmailModificationDemandByUserId(userId) {
    const key = 'VERIFY-EMAIL-' + userId;
    const emailModificationDemand = await temporaryStorage.get(key);

    if (!emailModificationDemand) return;

    return new EmailModificationDemand({
      newEmail: emailModificationDemand.newEmail,
      code: emailModificationDemand.code,
    });
  },
};
