module.exports = async function refreshAccessToken({ refreshToken, refreshTokenService }) {
  return refreshTokenService.refreshAccessToken({ refreshToken });
};
