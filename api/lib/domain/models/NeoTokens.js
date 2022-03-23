class NeoTokens {
  constructor({ accessToken, refreshToken, expiresIn, scope}) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresIn = expiresIn;
    this.scope = scope;
  }
}

module.exports = NeoTokens;
