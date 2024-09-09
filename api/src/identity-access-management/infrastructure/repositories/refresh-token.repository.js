import { temporaryStorage } from '../../../shared/infrastructure/temporary-storage/index.js';
import { PromiseUtils } from '../../../shared/infrastructure/utils/promise-utils.js';
import { RefreshToken } from '../../domain/models/RefreshToken.js';

// Refresh tokens are stored into 2 storage collections
//
// "refresh-tokens:" collection with the refresh token as key and token infos as value
const refreshTokenTemporaryStorage = temporaryStorage.withPrefix('refresh-tokens:');
// "user-refresh-tokens:" collection with the user ID as key and the list of refresh tokens of the user as value
const userRefreshTokensTemporaryStorage = temporaryStorage.withPrefix('user-refresh-tokens:');

/**
 * @typedef {function} findByToken
 * @param {Object} params
 * @param {string} params.token
 * @returns {Promise<RefreshToken>}
 */
async function findByToken({ token }) {
  const data = await refreshTokenTemporaryStorage.get(token);
  if (!data) return null;
  return new RefreshToken({ ...data, value: token });
}

/**
 * @typedef {function} findAllByUserId
 * @param {Object} params
 * @param {string|number} params.userId
 * @returns {Promise<Array<RefreshToken>>}
 */
async function findAllByUserId({ userId }) {
  const tokens = await userRefreshTokensTemporaryStorage.lrange(userId);
  if (!tokens || tokens.length === 0) return [];

  return PromiseUtils.mapSeries(tokens, async (token) => findByToken({ token }));
}

/**
 * @typedef {function} save
 * @param {Object} params
 * @param {RefreshToken} params.refreshToken
 * @return {Promise<void>}
 */
async function save({ refreshToken }) {
  const { value, userId, scope, source, expirationDelaySeconds } = refreshToken;

  await refreshTokenTemporaryStorage.save({
    key: value,
    value: { type: 'refresh_token', userId, scope, source },
    expirationDelaySeconds,
  });

  await userRefreshTokensTemporaryStorage.lpush({ key: userId, value });
  await userRefreshTokensTemporaryStorage.expire({ key: userId, expirationDelaySeconds });
}

/**
 * @typedef {function} revokeByToken
 * @param {Object} params
 * @param {string} params.token
 * @return {Promise<void>}
 */
async function revokeByToken({ token }) {
  const tokenData = await findByToken({ token });
  if (!tokenData) return;

  await refreshTokenTemporaryStorage.delete(token);

  await userRefreshTokensTemporaryStorage.lrem({ key: tokenData.userId, valueToRemove: token });
}

/**
 * @typedef {function} revokeAllByUserId
 * @param {Object} params
 * @param {string|number} params.userId
 * @return {Promise<void>}
 */
async function revokeAllByUserId({ userId }) {
  const tokens = await userRefreshTokensTemporaryStorage.lrange(userId);

  for (const token of tokens) {
    await refreshTokenTemporaryStorage.delete(token);
  }

  await userRefreshTokensTemporaryStorage.delete(userId);
}

/**
 * @typedef {Object} refreshTokenRepository
 * @property {findByToken} findByToken
 * @property {findAllByUserId} findAllByUserId
 * @property {save} save
 * @property {revokeByToken} revokeByToken
 * @property {revokeAllByUserId} revokeAllByUserId
 */
export const refreshTokenRepository = {
  findByToken,
  findAllByUserId,
  save,
  revokeByToken,
  revokeAllByUserId,
};
