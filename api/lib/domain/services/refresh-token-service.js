const settings = require('../../config');
const tokenService = require('./token-service');
const { UnauthorizedError } = require('../../application/http-errors');
const temporaryStorage = require('../../infrastructure/temporary-storage').withPrefix('refresh-tokens:');
const { v4: uuidv4 } = require('uuid');

function _prefixForUser(userId) {
  return `${userId}:`;
}

const refreshTokenExpression = /^([^:]+:[^:]+)(:(.*))?$/;

function _parseRefreshToken(refreshToken) {
  const result = refreshTokenExpression.exec(refreshToken);
  if (!result) throw new InvalidRefreshTokenError();
  const [, token, , childToken] = result;
  return { token, childToken };
}

async function createRefreshTokenFromUserId({ userId, source }) {
  const token = `${_prefixForUser(userId)}${uuidv4()}`;
  const expirationDelaySeconds = settings.authentication.refreshTokenLifespanMs / 1000;
  const tokenInfo = { type: 'refresh_token', userId, source };

  if (!settings.authentication.isRefreshTokenRotationEnabled) {
    return await temporaryStorage.save({
      key: token,
      value: tokenInfo,
      expirationDelaySeconds,
    });
  }

  tokenInfo.childToken = uuidv4();

  await temporaryStorage.save({
    key: token,
    value: tokenInfo,
    expirationDelaySeconds,
  });

  return `${token}:${tokenInfo.childToken}`;
}

async function refreshAccessToken({ refreshToken }) {
  const { token, childToken } = _parseRefreshToken(refreshToken);
  const tokenInfo = await temporaryStorage.get(token);
  if (!tokenInfo) throw new InvalidRefreshTokenError();

  // Check for different cases:
  //  - received a child token different from the one in temporary storage
  //  - received a child token while there is none in temporary storage
  //  - received no child token while there is one in temporary storage
  if (childToken !== tokenInfo.childToken) {
    await temporaryStorage.delete(token);
    throw new InvalidRefreshTokenError();
  }

  const { userId, source } = tokenInfo;

  const { accessToken, expirationDelaySeconds } = tokenService.createAccessTokenFromUser(userId, source);

  if (!settings.authentication.isRefreshTokenRotationEnabled) {
    // Unset child token if disabling refresh token rotation
    if (tokenInfo.childToken) {
      const { childToken: _, ...newTokenInfo } = tokenInfo;
      await temporaryStorage.update(token, newTokenInfo);
    }

    return { accessToken, expirationDelaySeconds, refreshToken: token };
  }

  // Renew refresh token's child token
  // (or set it for the first time if enabling refresh token rotation)
  const newTokenInfo = {
    ...tokenInfo,
    childToken: uuidv4(),
  };

  await temporaryStorage.update(token, newTokenInfo);

  return { accessToken, expirationDelaySeconds, refreshToken: `${token}:${newTokenInfo.childToken}` };
}

async function revokeRefreshToken({ refreshToken }) {
  try {
    const { token } = _parseRefreshToken(refreshToken);
    await temporaryStorage.delete(token);
  } catch (e) {
    await temporaryStorage.delete(refreshToken);
  }
}

async function revokeRefreshTokensForUserId({ userId }) {
  await temporaryStorage.deleteByPrefix(_prefixForUser(userId));
}

class InvalidRefreshTokenError extends UnauthorizedError {
  constructor() {
    super('Refresh token is invalid', 'INVALID_REFRESH_TOKEN');
  }
}

module.exports = {
  createRefreshTokenFromUserId,
  refreshAccessToken,
  revokeRefreshToken,
  revokeRefreshTokensForUserId,

  temporaryStorageForTests: temporaryStorage,
};
