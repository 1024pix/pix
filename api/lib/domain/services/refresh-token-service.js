const settings = require('../../config');
const temporaryStorage = require('../../infrastructure/temporary-storage');
const tokenService = require('./token-service');
const ms = require('ms');

async function createRefreshTokenFromUserId({ userId, source }) {
  const expirationDelaySeconds = ms(settings.authentication.refreshTokenLifespan) / 1000;
  return await temporaryStorage.save({
    value: { type: 'refresh_token', userId, source },
    expirationDelaySeconds,
  });
}

async function createAccessTokenFromRefreshToken({ refreshToken }) {
  const { userId, source } = (await temporaryStorage.get(refreshToken)) || {};
  if (!userId) return null;
  return tokenService.createAccessTokenFromUser(userId, source);
}

async function revokeRefreshToken({ refreshToken }) {
  await temporaryStorage.delete(refreshToken);
}

module.exports = {
  createRefreshTokenFromUserId,
  createAccessTokenFromRefreshToken,
  revokeRefreshToken,
};
