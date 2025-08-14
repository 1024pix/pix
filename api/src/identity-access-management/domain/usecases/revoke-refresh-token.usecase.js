import { refreshTokenRepository as injectedRefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository.js'; /**
 * @param {{
 *   refreshToken: string,
 *   refreshTokenRepository: RefreshTokenRepository
 * }} params
 * @return {Promise<void>}
 */
export const revokeRefreshToken = async function ({
  refreshToken,
  refreshTokenRepository = injectedRefreshTokenRepository,
} = {}) {
  await refreshTokenRepository.revokeByToken({ token: refreshToken });
};
