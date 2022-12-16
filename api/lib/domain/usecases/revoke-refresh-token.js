module.exports = async function revokeRefreshToken({ refreshToken, refreshTokenService }) {
  await refreshTokenService.revokeRefreshToken({ refreshToken });
};
