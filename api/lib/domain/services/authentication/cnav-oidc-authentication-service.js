const settings = require('../../../config.js');
const OidcAuthenticationService = require('./oidc-authentication-service.js');

class CnavOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      source: 'cnav',
      identityProvider: 'CNAV',
      slug: 'cnav',
      organizationName: 'CNAV',
      hasLogoutUrl: false,
      jwtOptions: { expiresIn: settings.cnav.accessTokenLifespanMs / 1000 },
      clientSecret: settings.cnav.clientSecret,
      clientId: settings.cnav.clientId,
      tokenUrl: settings.cnav.tokenUrl,
      authenticationUrl: settings.cnav.authenticationUrl,
      authenticationUrlParameters: [{ key: 'scope', value: 'openid profile' }],
      userInfoUrl: settings.cnav.userInfoUrl,
    });
  }
}

module.exports = CnavOidcAuthenticationService;
