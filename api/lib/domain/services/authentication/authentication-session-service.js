import { settings } from '../../../config.js';
import { temporaryStorage } from '../../../infrastructure/temporary-storage/index.js';
const authenticationSessionTemporaryStorage = temporaryStorage.withPrefix('authentication-session:');

const EXPIRATION_DELAY_SECONDS = settings.authenticationSession.temporaryStorage.expirationDelaySeconds;

const getByKey = function (key) {
  return authenticationSessionTemporaryStorage.get(key);
};

const save = function (authenticationContent) {
  return authenticationSessionTemporaryStorage.save({
    value: authenticationContent,
    expirationDelaySeconds: EXPIRATION_DELAY_SECONDS,
  });
};

const update = function (key, value) {
  authenticationSessionTemporaryStorage.update(key, value);
};

export { getByKey, save, update };
