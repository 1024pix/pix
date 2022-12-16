const settings = require('../../../config');
const temporaryStorage = require('../../../infrastructure/temporary-storage').withPrefix('authentication-session:');

const EXPIRATION_DELAY_SECONDS = settings.authenticationSession.temporaryStorage.expirationDelaySeconds;

module.exports = {
  getByKey(key) {
    return temporaryStorage.get(key);
  },

  save(authenticationContent) {
    return temporaryStorage.save({
      value: authenticationContent,
      expirationDelaySeconds: EXPIRATION_DELAY_SECONDS,
    });
  },

  update(key, value) {
    temporaryStorage.update(key, value);
  },
};
