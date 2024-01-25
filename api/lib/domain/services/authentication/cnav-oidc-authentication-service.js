import { config } from '../../../config.js';
import { OidcAuthenticationService } from './oidc-authentication-service.js';
import { CNAV } from '../../constants/oidc-identity-providers.js';

const configKey = CNAV.configKey;

class CnavOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      authenticationUrl: config[configKey].authenticationUrl,
      authenticationUrlParameters: [{ key: 'scope', value: 'openid profile' }],
      clientId: config[configKey].clientId,
      clientSecret: config[configKey].clientSecret,
      configKey,
      hasLogoutUrl: false,
      identityProvider: CNAV.code,
      jwtOptions: { expiresIn: config[configKey].accessTokenLifespanMs / 1000 },
      organizationName: 'CNAV',
      slug: 'cnav',
      source: 'cnav',
      tokenUrl: config[configKey].tokenUrl,
      userInfoUrl: config[configKey].userInfoUrl,
    });
  }
}

export { CnavOidcAuthenticationService };
