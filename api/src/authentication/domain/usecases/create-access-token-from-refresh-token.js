const createAccessTokenFromRefreshToken = async function ({ refreshToken, refreshTokenService }) {
  return refreshTokenService.createAccessTokenFromRefreshToken({ refreshToken });
};

export { createAccessTokenFromRefreshToken };
