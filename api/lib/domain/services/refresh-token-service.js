const bluebird = require('bluebird');
const settings = require('../../config');
const tokenService = require('./token-service');
const { UnauthorizedError } = require('../../application/http-errors');
const refreshTokenTemporaryStorage = require('../../infrastructure/temporary-storage').withPrefix('refresh-tokens:');
const userRefreshTokensTemporaryStorage = require('../../infrastructure/temporary-storage').withPrefix(
  'user-refresh-tokens:'
);
const { v4: uuidv4 } = require('uuid');

function _prefixForUser(userId) {
  return `${userId}:`;
}

async function createRefreshTokenFromUserId({ userId, source, uuidGenerator = uuidv4 }) {
  const expirationDelaySeconds = settings.authentication.refreshTokenLifespanMs / 1000;
  const refreshToken = `${_prefixForUser(userId)}${uuidGenerator()}`;

  await refreshTokenTemporaryStorage.save({
    key: refreshToken,
    value: { type: 'refresh_token', userId, source },
    expirationDelaySeconds,
  });
  await userRefreshTokensTemporaryStorage.lpush({ key: userId, value: refreshToken });

  return refreshToken;
}

async function createAccessTokenFromRefreshToken({ refreshToken }) {
  const { userId, source } = (await refreshTokenTemporaryStorage.get(refreshToken)) || {};
  if (!userId) throw new UnauthorizedError('Refresh token is invalid', 'INVALID_REFRESH_TOKEN');

  const userRefreshTokens = (await userRefreshTokensTemporaryStorage.lrange(userId)) || [];
  const refreshTokenFound = userRefreshTokens.find((userRefreshToken) => userRefreshToken === refreshToken);

  if (!refreshTokenFound) {
    await userRefreshTokensTemporaryStorage.lpush({ key: userId, value: refreshToken });
  }

  return tokenService.createAccessTokenFromUser(userId, source);
}

async function revokeRefreshToken({ refreshToken }) {
  const { userId } = (await refreshTokenTemporaryStorage.get(refreshToken)) || {};
  if (!userId) return;
  await userRefreshTokensTemporaryStorage.lrem({ key: userId, valueToRemove: refreshToken });
  await refreshTokenTemporaryStorage.delete(refreshToken);
}

async function revokeRefreshTokensForUserId({ userId }) {
  const refreshTokens = await userRefreshTokensTemporaryStorage.lrange(userId);
  await userRefreshTokensTemporaryStorage.delete(userId);
  await bluebird.mapSeries(refreshTokens, (refreshToken) => {
    return refreshTokenTemporaryStorage.delete(refreshToken);
  });
  await refreshTokenTemporaryStorage.deleteByPrefix(_prefixForUser(userId));
}

module.exports = {
  createRefreshTokenFromUserId,
  createAccessTokenFromRefreshToken,
  revokeRefreshToken,
  revokeRefreshTokensForUserId,

  refreshTokenTemporaryStorageForTests: refreshTokenTemporaryStorage,
  userRefreshTokensTemporaryStorageForTests: userRefreshTokensTemporaryStorage,
};
