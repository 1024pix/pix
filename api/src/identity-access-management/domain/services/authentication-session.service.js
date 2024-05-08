import { temporaryStorage } from '../../../../lib/infrastructure/temporary-storage/index.js';
import { config } from '../../../shared/config.js';
const authenticationSessionTemporaryStorage = temporaryStorage.withPrefix('authentication-session:');

const EXPIRATION_DELAY_SECONDS = config.authenticationSession.temporaryStorage.expirationDelaySeconds;

/**
 * @typedef {function} getByKey
 * @param {string} key
 * @return {Promise<*>}
 */
const getByKey = function (key) {
  return authenticationSessionTemporaryStorage.get(key);
};

/**
 * @typedef {function} save
 * @param {*} authenticationContent
 * @return {Promise<string>}
 */
const save = function (authenticationContent) {
  return authenticationSessionTemporaryStorage.save({
    value: authenticationContent,
    expirationDelaySeconds: EXPIRATION_DELAY_SECONDS,
  });
};

/**
 * @typedef {function} update
 * @param {string} key
 * @param {*} value
 * @return {void|Promise<void>}
 */
const update = function (key, value) {
  authenticationSessionTemporaryStorage.update(key, value);
};

/**
 * @typedef {Object} AuthenticationSessionService
 * @property {getByKey} getByKey
 * @property {save} save
 * @property {update} update
 */
const authenticationSessionService = { getByKey, save, update };

export { authenticationSessionService };
