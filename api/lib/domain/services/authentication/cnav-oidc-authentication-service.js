import { config } from '../../../config.js';
import * as OidcAuthenticationService from './oidc-authentication-service.js';

class CnavOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      source: 'cnav',
      identityProvider: 'CNAV',
      slug: 'cnav',
      organizationName: 'CNAV',
      hasLogoutUrl: false,
      jwtOptions: { expiresIn: config.cnav.accessTokenLifespanMs / 1000 },
      clientSecret: config.cnav.clientSecret,
      clientId: config.cnav.clientId,
      tokenUrl: config.cnav.tokenUrl,
      authenticationUrl: config.cnav.authenticationUrl,
      authenticationUrlParameters: [{ key: 'scope', value: 'openid profile' }],
      userInfoUrl: config.cnav.userInfoUrl,
    });
  }
}

export { CnavOidcAuthenticationService };
