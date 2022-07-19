const jsonwebtoken = require('jsonwebtoken');
const settings = require('../../../config');

class OidcAuthenticationService {
  constructor({ source, identityProvider, jwtOptions }) {
    this.source = source;
    this.identityProvider = identityProvider;
    this.jwtOptions = jwtOptions;
  }

  createAccessToken(userId) {
    return jsonwebtoken.sign(
      {
        user_id: userId,
        source: this.source,
        identity_provider: this.identityProvider,
      },
      settings.authentication.secret,
      this.jwtOptions
    );
  }
}

module.exports = OidcAuthenticationService;
