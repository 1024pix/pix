export default async function createAccessTokenFromRefreshToken({ refreshToken, refreshTokenService }) {
  return refreshTokenService.createAccessTokenFromRefreshToken({ refreshToken });
}
