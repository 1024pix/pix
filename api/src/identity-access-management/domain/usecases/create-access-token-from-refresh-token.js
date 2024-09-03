const createAccessTokenFromRefreshToken = async function ({ refreshToken, scope, refreshTokenService }) {
  return refreshTokenService.createAccessTokenFromRefreshToken({ refreshToken, scope });
};

export { createAccessTokenFromRefreshToken };
