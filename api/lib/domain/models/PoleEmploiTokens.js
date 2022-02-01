class PoleEmploiTokens {
  constructor({ accessToken, idToken, expiresIn, refreshToken }) {
    this.accessToken = accessToken;
    this.idToken = idToken;
    this.expiresIn = expiresIn;
    this.refreshToken = refreshToken;
  }
}

module.exports = PoleEmploiTokens;
