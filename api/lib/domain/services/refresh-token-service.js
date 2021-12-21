const settings = require('../../config');
const temporaryStorage = require('../../infrastructure/temporary-storage');
const ms = require('ms');

async function createRefreshTokenFromUserId({ userId, source }) {
  const expirationDelaySeconds = ms(settings.authentication.refreshTokenLifespan) / 1000;
  return await temporaryStorage.save({
    value: { type: 'refresh_token', userId, source },
    expirationDelaySeconds,
  });
}

module.exports = {
  createRefreshTokenFromUserId,
};
