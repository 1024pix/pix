const settings = require('../../config');
const temporaryStorage = require('../temporary-storage').withPrefix('authentication-session:');

const EXPIRATION_DELAY_SECONDS = settings.authenticationSession.temporaryStorage.expirationDelaySeconds;

module.exports = {
  save(authenticationSessionTokens) {
    return temporaryStorage.save({
      value: authenticationSessionTokens,
      expirationDelaySeconds: EXPIRATION_DELAY_SECONDS,
    });
  },

  getByKey(key) {
    return temporaryStorage.get(key);
  },
};
