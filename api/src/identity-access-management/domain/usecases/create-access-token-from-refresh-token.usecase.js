import { UnauthorizedError } from '../../../shared/application/http-errors.js';
import { tokenService as injectedTokenService } from '../../../shared/domain/services/token-service.js';
import { refreshTokenRepository as injectedRefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository.js';

const createAccessTokenFromRefreshToken = async function ({
  refreshToken,
  refreshTokenRepository = injectedRefreshTokenRepository,
  tokenService = injectedTokenService,
  audience,
} = {}) {
  const foundRefreshToken = await refreshTokenRepository.findByToken({ token: refreshToken });

  if (!foundRefreshToken) {
    throw new UnauthorizedError('Refresh token is invalid', 'INVALID_REFRESH_TOKEN');
  }

  if (!foundRefreshToken.hasSameAudience(audience)) {
    throw new UnauthorizedError('Refresh token is invalid', 'INVALID_REFRESH_TOKEN');
  }

  return tokenService.createAccessTokenFromUser({
    userId: foundRefreshToken.userId,
    source: foundRefreshToken.source,
    audience,
  });
};

export { createAccessTokenFromRefreshToken };
