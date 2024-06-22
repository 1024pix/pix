/**
 * @param {{
 *   refreshToken: string,
 *   refreshTokenService: RefreshTokenService
 * }} params
 * @return {Promise<void>}
 */
export const revokeRefreshToken = async function ({ refreshToken, refreshTokenService }) {
  await refreshTokenService.revokeRefreshToken({ refreshToken });
};
