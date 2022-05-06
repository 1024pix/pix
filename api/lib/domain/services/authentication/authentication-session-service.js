const settings = require('../../../config');
const temporaryStorage = require('../../../infrastructure/temporary-storage').withPrefix('authentication-session:');

const EXPIRATION_DELAY_SECONDS = settings.authenticationSession.temporaryStorage.expirationDelaySeconds;

module.exports = {
  getByKey(key) {
    return temporaryStorage.get(key);
  },

  save(sessionContent) {
    return temporaryStorage.save({
      value: sessionContent,
      expirationDelaySeconds: EXPIRATION_DELAY_SECONDS,
    });
  },
};
