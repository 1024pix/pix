import { UnauthorizedError } from '../../../shared/application/errors/http-errors.js';
import { InvalidInputDataError } from '../../../shared/domain/errors.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { UserAccessToken } from '../models/UserAccessToken.js';
import { UserRefreshToken } from '../models/UserRefreshToken.js';

const logger = child('iam:create-access-token-from-refresh-token', { event: SCOPES.IAM });

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
export async function createAccessTokenFromRefreshToken({
  refreshToken,
  audience,
  locale,
  refreshTokenRepository,
  userRepository,
  revokedUserAccessRepository,
}) {
  let decodedRefreshToken;

  try {
    if (RefreshToken.isStatefulRefreshToken(refreshToken)) {
      decodedRefreshToken = await refreshTokenRepository.findByToken({ token: refreshToken });

      if (!decodedRefreshToken) {
        throw new UnauthorizedError('Refresh token is invalid', 'INVALID_REFRESH_TOKEN');
      }

      if (!decodedRefreshToken.hasSameAudience(audience)) {
        throw new UnauthorizedError('Refresh token is invalid', 'INVALID_REFRESH_TOKEN');
      }
    } else {
      decodedRefreshToken = UserRefreshToken.decode(refreshToken);
      decodedRefreshToken.assertSameAudience(audience);
    }

    const revokedUserAccess = await revokedUserAccessRepository.findByUserId(decodedRefreshToken.userId);
    revokedUserAccess.assertRefreshTokenNotRevoked(decodedRefreshToken);
  } catch (err) {
    if (err instanceof InvalidInputDataError) {
      logger.warn({ err });
      throw new UnauthorizedError('Refresh token is invalid', 'INVALID_REFRESH_TOKEN');
    }
    throw err;
  }

  const foundUser = await userRepository.findById(decodedRefreshToken.userId);
  const changedLocale = foundUser.changeLocale(locale);
  if (changedLocale) {
    await userRepository.update({ id: foundUser.id, locale: foundUser.locale });
  }

  return UserAccessToken.generateUserToken({
    userId: decodedRefreshToken.userId,
    source: decodedRefreshToken.source,
    audience,
    sessionId: decodedRefreshToken.sessionId,
  });
}
