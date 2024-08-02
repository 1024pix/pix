import { randomUUID } from 'node:crypto';

import { UnauthorizedError } from '../../../shared/application/http-errors.js';
import { config } from '../../../shared/config.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';
import { temporaryStorage } from '../../../shared/infrastructure/temporary-storage/index.js';

const refreshTokenTemporaryStorage = temporaryStorage.withPrefix('refresh-tokens:');
const userRefreshTokensTemporaryStorage = temporaryStorage.withPrefix('user-refresh-tokens:');

const REFRESH_TOKEN_EXPIRATION_DELAY_ADDITION_SECONDS = 60 * 60; // 1 hour

/**
 * @param refreshToken
 * @returns {Promise<{userId: string, source: string}>}
 */
async function findByRefreshToken(refreshToken) {
  return refreshTokenTemporaryStorage.get(refreshToken);
}

/**
 * @param userId
 * @returns {Promise<Array<string>>}
 */
async function findByUserId(userId) {
  return userRefreshTokensTemporaryStorage.lrange(userId);
}

/**
 * @typedef {function} createRefreshTokenFromUserId
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.source
 * @param {function} params.uuidGenerator
 * @return {Promise<string>}
 */
async function createRefreshTokenFromUserId({ userId, source, uuidGenerator = randomUUID }) {
  const expirationDelaySeconds = config.authentication.refreshTokenLifespanMs / 1000;
  const refreshToken = `${_prefixForUser(userId)}${uuidGenerator()}`;

  await refreshTokenTemporaryStorage.save({
    key: refreshToken,
    value: { type: 'refresh_token', userId, source },
    expirationDelaySeconds,
  });
  await userRefreshTokensTemporaryStorage.lpush({ key: userId, value: refreshToken });
  await userRefreshTokensTemporaryStorage.expire({
    key: userId,
    expirationDelaySeconds: expirationDelaySeconds + REFRESH_TOKEN_EXPIRATION_DELAY_ADDITION_SECONDS,
  });

  return refreshToken;
}

/**
 * @typedef {function} createAccessTokenFromRefreshToken
 * @param {Object} params
 * @param {string} params.refreshToken
 * @return {Promise<{expirationDelaySeconds: number, accessToken: string}>}
 */
async function createAccessTokenFromRefreshToken({ refreshToken }) {
  const { userId, source } = (await findByRefreshToken(refreshToken)) || {};
  if (!userId) throw new UnauthorizedError('Refresh token is invalid', 'INVALID_REFRESH_TOKEN');
  return tokenService.createAccessTokenFromUser(userId, source);
}

/**
 * @typedef {function} revokeRefreshToken
 * @param {Object} params
 * @param {string} params.refreshToken
 * @return {Promise<void>}
 */
async function revokeRefreshToken({ refreshToken }) {
  const { userId } = (await findByRefreshToken(refreshToken)) || {};
  if (!userId) return;
  await userRefreshTokensTemporaryStorage.lrem({ key: userId, valueToRemove: refreshToken });
  await refreshTokenTemporaryStorage.delete(refreshToken);
}

/**
 * @typedef {function} revokeRefreshTokensForUserId
 * @param {Object} params
 * @param {string|number} params.userId
 * @return {Promise<void>}
 */
async function revokeRefreshTokensForUserId({ userId }) {
  const refreshTokens = await findByUserId(userId);
  await userRefreshTokensTemporaryStorage.delete(userId);
  for (const refreshToken of refreshTokens) {
    await refreshTokenTemporaryStorage.delete(refreshToken);
  }
}

/**
 * @typedef {Object} RefreshTokenService
 * @property {createAccessTokenFromRefreshToken} createAccessTokenFromRefreshToken
 * @property {createRefreshTokenFromUserId} createRefreshTokenFromUserId
 * @property {revokeRefreshToken} revokeRefreshToken
 * @property {revokeRefreshTokensForUserId} revokeRefreshTokensForUserId
 */
export const refreshTokenService = {
  findByRefreshToken,
  findByUserId,
  createAccessTokenFromRefreshToken,
  createRefreshTokenFromUserId,
  revokeRefreshToken,
  revokeRefreshTokensForUserId,
};

function _prefixForUser(userId) {
  return `${userId}:`;
}
