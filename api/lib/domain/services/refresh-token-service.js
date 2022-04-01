const settings = require('../../config');
const tokenService = require('./token-service');
const { UnauthorizedError } = require('../../application/http-errors');
const temporaryStorage = require('../../infrastructure/temporary-storage').withPrefix('refresh-tokens:');
const { v4: uuidv4 } = require('uuid');

async function createRefreshTokenFromUserId({ userId, source }) {
  const expirationDelaySeconds = settings.authentication.refreshTokenLifespanMs / 1000;
  const token = uuidv4();
  return await temporaryStorage.save({
    key: token,
    value: { type: 'refresh_token', userId, source },
    expirationDelaySeconds,
  });
}

async function createAccessTokenFromRefreshToken({ refreshToken }) {
  const { userId, source } = (await temporaryStorage.get(refreshToken)) || {};
  if (!userId) throw new UnauthorizedError('Refresh token is invalid', 'INVALID_REFRESH_TOKEN');
  return tokenService.createAccessTokenFromUser(userId, source);
}

async function revokeRefreshToken({ refreshToken }) {
  await temporaryStorage.delete(refreshToken);
}

module.exports = {
  createRefreshTokenFromUserId,
  createAccessTokenFromRefreshToken,
  revokeRefreshToken,

  temporaryStorageForTests: temporaryStorage,
};
