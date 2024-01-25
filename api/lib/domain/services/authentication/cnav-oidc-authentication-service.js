import { config } from '../../../config.js';
import { OidcAuthenticationService } from './oidc-authentication-service.js';
import { CNAV } from '../../constants/oidc-identity-providers.js';

const configKey = CNAV.configKey;

class CnavOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      authenticationUrl: config.cnav.authenticationUrl,
      authenticationUrlParameters: [{ key: 'scope', value: 'openid profile' }],
      clientId: config.cnav.clientId,
      clientSecret: config.cnav.clientSecret,
      configKey,
      hasLogoutUrl: false,
      identityProvider: CNAV.code,
      jwtOptions: { expiresIn: config.cnav.accessTokenLifespanMs / 1000 },
      organizationName: 'CNAV',
      slug: 'cnav',
      source: 'cnav',
      tokenUrl: config.cnav.tokenUrl,
      userInfoUrl: config.cnav.userInfoUrl,
    });
  }
}

export { CnavOidcAuthenticationService };
