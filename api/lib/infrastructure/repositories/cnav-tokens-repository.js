const settings = require('../../config');
const temporaryStorage = require('../temporary-storage').withPrefix('cnav-tokens:');

const EXPIRATION_DELAY_SECONDS = settings.cnav.temporaryStorage.expirationDelaySeconds;

module.exports = {
  save(cnavTokens) {
    return temporaryStorage.save({
      value: cnavTokens,
      expirationDelaySeconds: EXPIRATION_DELAY_SECONDS,
    });
  },

  getByKey(key) {
    return temporaryStorage.get(key);
  },
};
