/**
 * @param {{
 *   refreshToken: string,
 *   refreshTokenRepository: RefreshTokenRepository
 * }} params
 * @return {Promise<void>}
 */
export const revokeRefreshToken = async function ({ refreshToken, refreshTokenRepository }) {
  await refreshTokenRepository.revokeByToken({ token: refreshToken });
};
