const settings = require('../../config');
const temporaryStorage = require('../temporary-storage');
const EXPIRATION_DELAY_SECONDS = settings.temporaryStorage.expirationDelaySeconds;

module.exports = {

  saveEmailModificationDemand({ userId, code, newEmail }) {
    const key = 'VERIFY-EMAIL-' + userId;

    return temporaryStorage.save({
      key,
      value: { code, newEmail },
      expirationDelaySeconds: EXPIRATION_DELAY_SECONDS,
    });
  },
};
