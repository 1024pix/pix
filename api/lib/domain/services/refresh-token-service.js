const settings = require('../../config');
const tokenService = require('./token-service');
const { UnauthorizedError } = require('../../application/http-errors');
const temporaryStorage = require('../../infrastructure/temporary-storage').withPrefix('refresh-tokens:');
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

  await temporaryStorage.save({
    key: refreshToken,
    value: { type: 'refresh_token', userId, source },
    expirationDelaySeconds,
  });
  await userRefreshTokensTemporaryStorage.lpush({ key: userId, value: refreshToken });

  return refreshToken;
}

async function createAccessTokenFromRefreshToken({ refreshToken }) {
  const { userId, source } = (await temporaryStorage.get(refreshToken)) || {};
  if (!userId) throw new UnauthorizedError('Refresh token is invalid', 'INVALID_REFRESH_TOKEN');
  return tokenService.createAccessTokenFromUser(userId, source);
}

async function revokeRefreshToken({ refreshToken }) {
  await temporaryStorage.delete(refreshToken);
}

async function revokeRefreshTokensForUserId({ userId }) {
  await temporaryStorage.deleteByPrefix(_prefixForUser(userId));
}

module.exports = {
  createRefreshTokenFromUserId,
  createAccessTokenFromRefreshToken,
  revokeRefreshToken,
  revokeRefreshTokensForUserId,

  temporaryStorageForTests: temporaryStorage,
  userRefreshTokensTemporaryStorageForTests: userRefreshTokensTemporaryStorage,
};
