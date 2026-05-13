import { UnauthorizedError } from '../../../shared/application/errors/http-errors.js';
import { UserAccessToken } from '../models/UserAccessToken.js';

/**
 * typedef { function } createAccessTokenFromRefreshToken
 * @param {Object} params
 * @param {string} params.refreshToken
 * @param {string} params.audience
 * @param {string} params.locale
 * @param {RefreshTokenRepository} params.refreshTokenRepository
 * @param {UserRepository} params.userRepository
 * @returns {Promise<{accessToken: (*), expirationDelaySeconds: *}>}
 */
const createAccessTokenFromRefreshToken = async function ({
  refreshToken,
  audience,
  locale,
  refreshTokenRepository,
  userRepository,
}) {
  // const foundRefreshToken = await refreshTokenRepository.findByToken({ token: refreshToken });

  // if (!foundRefreshToken) {
  //   throw new UnauthorizedError('Refresh token is invalid', 'INVALID_REFRESH_TOKEN');
  // }
  assertRefreshTokenIsValid(refreshToken) // using tokenService.getDecodedToken

  if (!foundRefreshToken.hasSameAudience(audience)) {
    throw new UnauthorizedError('Refresh token is invalid', 'INVALID_REFRESH_TOKEN');
  }

  const foundUser = await userRepository.findById(foundRefreshToken.userId);
  const changedLocale = foundUser.changeLocale(locale);
  if (changedLocale) {
    await userRepository.update({ id: foundUser.id, locale: foundUser.locale });
  }

  return UserAccessToken.generateUserToken({
    userId: foundRefreshToken.userId,
    source: foundRefreshToken.source,
    audience,
    sid: refreshToken.sid,
  });
};

export { createAccessTokenFromRefreshToken };
