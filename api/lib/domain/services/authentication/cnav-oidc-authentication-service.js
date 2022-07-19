const settings = require('../../../config');
const OidcAuthenticationService = require('./oidc-authentication-service');

class CnavOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    const source = 'cnav';
    const identityProvider = 'CNAV';
    const expirationDelaySeconds = settings.cnav.accessTokenLifespanMs / 1000;
    const jwtOptions = { expiresIn: expirationDelaySeconds };

    super({ source, identityProvider, jwtOptions });
  }
}

module.exports = CnavOidcAuthenticationService;
