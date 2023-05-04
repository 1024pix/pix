const revokeRefreshToken = async function ({ refreshToken, refreshTokenService }) {
  await refreshTokenService.revokeRefreshToken({ refreshToken });
};

export { revokeRefreshToken };
