import settings from '../../../config';
import temporaryStorage from '../../../infrastructure/temporary-storage';
const temporaryStorageForAuthenticationSession = temporaryStorage.withPrefix('authentication-session:');

const EXPIRATION_DELAY_SECONDS = settings.authenticationSession.temporaryStorage.expirationDelaySeconds;

export default {
  getByKey(key) {
    return temporaryStorageForAuthenticationSession.get(key);
  },

  save(authenticationContent) {
    return temporaryStorageForAuthenticationSession.save({
      value: authenticationContent,
      expirationDelaySeconds: EXPIRATION_DELAY_SECONDS,
    });
  },

  update(key, value) {
    temporaryStorageForAuthenticationSession.update(key, value);
  },
};
