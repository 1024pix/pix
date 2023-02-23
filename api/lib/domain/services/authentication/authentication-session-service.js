const settings = require('../../../config');
const temporaryStorage = require('../../../infrastructure/temporary-storage/index.js');
const authenticationSessionTemporaryStorage = temporaryStorage.withPrefix('authentication-session:');

const EXPIRATION_DELAY_SECONDS = settings.authenticationSession.temporaryStorage.expirationDelaySeconds;

module.exports = {
  getByKey(key) {
    return authenticationSessionTemporaryStorage.get(key);
  },

  save(authenticationContent) {
    return authenticationSessionTemporaryStorage.save({
      value: authenticationContent,
      expirationDelaySeconds: EXPIRATION_DELAY_SECONDS,
    });
  },

  update(key, value) {
    authenticationSessionTemporaryStorage.update(key, value);
  },
};
