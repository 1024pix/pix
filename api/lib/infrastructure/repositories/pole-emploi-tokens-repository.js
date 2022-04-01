const settings = require('../../config');
const temporaryStorage = require('../temporary-storage').withPrefix('pole-emploi-tokens:');

const EXPIRATION_DELAY_SECONDS = settings.poleEmploi.temporaryStorage.expirationDelaySeconds;

module.exports = {
  save(poleEmploiTokens) {
    return temporaryStorage.save({
      value: poleEmploiTokens,
      expirationDelaySeconds: EXPIRATION_DELAY_SECONDS,
    });
  },

  getByKey(key) {
    return temporaryStorage.get(key);
  },
};
