const createAccessTokenFromRefreshToken = async function ({ refreshToken, audience, refreshTokenService }) {
  return refreshTokenService.createAccessTokenFromRefreshToken({ refreshToken, audience });
};

export { createAccessTokenFromRefreshToken };
