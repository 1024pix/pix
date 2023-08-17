import { config } from '../../../config.js';
import { CNAV } from '../../constants/oidc-identity-providers.js';
import { OidcAuthenticationService } from './oidc-authentication-service.js';

const configKey = CNAV.configKey;

class CnavOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      identityProvider: CNAV.code,
      configKey,
      source: 'cnav',
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
