const settings = require('../../../config');
const OidcAuthenticationService = require('./oidc-authentication-service');

class CnavOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    const source = 'cnav';
    const identityProvider = 'CNAV';
    const expirationDelaySeconds = settings.cnav.accessTokenLifespanMs / 1000;
    const jwtOptions = { expiresIn: expirationDelaySeconds };
    const clientSecret = settings.cnav.clientSecret;
    const clientId = settings.cnav.clientId;
    const tokenUrl = settings.cnav.tokenUrl;
    const authenticationUrl = settings.cnav.authenticationUrl;
    const authenticationUrlParameters = [{ key: 'scope', value: 'openid profile' }];

    super({
      source,
      identityProvider,
      jwtOptions,
      clientSecret,
      clientId,
      tokenUrl,
      authenticationUrl,
      authenticationUrlParameters,
    });
  }
}

module.exports = CnavOidcAuthenticationService;
