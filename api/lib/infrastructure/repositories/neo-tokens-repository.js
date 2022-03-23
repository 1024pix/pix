const settings = require('../../config');

const temporaryStorage = require('../temporary-storage');

const EXPIRATION_DELAY_SECONDS = settings.neo.temporaryStorage.expirationDelaySeconds;

module.exports = {
  save(neoTokens) {
    return temporaryStorage.save({
      value: neoTokens,
      expirationDelaySeconds: EXPIRATION_DELAY_SECONDS,
    });
  },

  getByKey(key) {
    return temporaryStorage.get(key);
  },
};
