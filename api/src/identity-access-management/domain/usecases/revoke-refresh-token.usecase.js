import { RefreshToken } from '../models/RefreshToken.js';

/**
 * @param {{
 *   refreshToken: string,
 *   refreshTokenRepository: RefreshTokenRepository
 * }} params
 * @return {Promise<void>}
 * @deprecated replaced by revokeSession usecase
 */
export const revokeRefreshToken = async function ({ refreshToken, refreshTokenRepository }) {
  if (!RefreshToken.isStatefulRefreshToken(refreshToken)) return;

  await refreshTokenRepository.revokeByToken({ token: refreshToken });
};
