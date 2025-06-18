import crypto from 'node:crypto';

import { config } from '../../../shared/config.js';
import { temporaryStorage } from '../../../shared/infrastructure/key-value-storages/index.js';

const anonymousUserTokensTemporaryStorage = temporaryStorage.withPrefix('anonymous-user-tokens:');

/**
 * @param {*} userId User ID of the anonymous user
 * @returns {Promise<string|null>} Token as UUID or null if not found
 */
const find = (userId) => {
  return anonymousUserTokensTemporaryStorage.get(userId);
};

/**
 * @param {*} userId User ID of the anonymous user
 * @returns {Promise<string>} Token as UUID
 */
const save = async (userId) => {
  const token = crypto.randomUUID();
  const { expirationDelaySeconds } = config.temporaryStorageForAnonymousUserTokens;

  await anonymousUserTokensTemporaryStorage.save({ key: userId, value: token, expirationDelaySeconds });

  return token;
};

export const anonymousUserTokenRepository = { find, save };
