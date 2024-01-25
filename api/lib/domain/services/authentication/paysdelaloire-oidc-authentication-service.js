import { config } from '../../../../src/shared/config.js';

import { OidcAuthenticationService } from './oidc-authentication-service.js';
import { PAYSDELALOIRE } from '../../constants/oidc-identity-providers.js';

const configKey = PAYSDELALOIRE.configKey;

class PaysdelaloireOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      authenticationUrl: config[configKey].authenticationUrl,
      authenticationUrlParameters: [{ key: 'scope', value: 'openid profile' }],
      clientId: config[configKey].clientId,
      clientSecret: config[configKey].clientSecret,
      configKey,
      endSessionUrl: config[configKey].endSessionUrl,
      hasLogoutUrl: false,
      identityProvider: PAYSDELALOIRE.code,
      jwtOptions: { expiresIn: config[configKey].accessTokenLifespanMs / 1000 },
      organizationName: 'Pays de la Loire',
      postLogoutRedirectUri: config[configKey].postLogoutRedirectUri,
      slug: 'pays-de-la-loire',
      source: 'paysdelaloire',
      tokenUrl: config[configKey].tokenUrl,
      userInfoUrl: config[configKey].userInfoUrl,
    });
  }
}

export { PaysdelaloireOidcAuthenticationService };
