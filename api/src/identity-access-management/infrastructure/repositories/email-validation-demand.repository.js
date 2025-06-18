import crypto from 'node:crypto';

import { config } from '../../../shared/config.js';
import { temporaryStorage } from '../../../shared/infrastructure/key-value-storages/index.js';

const emailValidationDemandTemporaryStorage = temporaryStorage.withPrefix('email-validation-demand:');

/**
 * @param {string} token
 * @return {Promise<string|null>}
 */
const get = (token) => {
  return emailValidationDemandTemporaryStorage.get(token);
};

/**
 * @param {string} token
 * @return {Promise<void>}
 */
const remove = async (token) => {
  await emailValidationDemandTemporaryStorage.delete(token);
};

/**
 * @param {string} userId
 * @returns {Promise<string>} - generated token as UUID
 */
const save = async (userId) => {
  const token = crypto.randomUUID();
  await emailValidationDemandTemporaryStorage.save({
    key: token,
    value: userId,
    expirationDelaySeconds: config.temporaryStorageForEmailValidationDemands.expirationDelaySeconds,
  });
  return token;
};

/**
 * @typedef EmailValidationDemandRepository
 */
export const emailValidationDemandRepository = {
  get,
  remove,
  save,
};
