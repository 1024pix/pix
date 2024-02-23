import { config } from '../../../../src/shared/config.js';

import { OidcAuthenticationService } from './oidc-authentication-service.js';
import { PAYSDELALOIRE } from '../../constants/oidc-identity-providers.js';

const configKey = PAYSDELALOIRE.configKey;

class PaysdelaloireOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      clientId: config[configKey].clientId,
      clientSecret: config[configKey].clientSecret,
      configKey,
      endSessionUrl: config[configKey].endSessionUrl,
      hasLogoutUrl: false,
      identityProvider: PAYSDELALOIRE.code,
      jwtOptions: { expiresIn: config[configKey].accessTokenLifespanMs / 1000 },
      openidConfigurationUrl: config[configKey].openidConfigurationUrl,
      organizationName: 'Pays de la Loire',
      postLogoutRedirectUri: config[configKey].postLogoutRedirectUri,
      redirectUri: config[configKey].redirectUri,
      slug: 'pays-de-la-loire',
      source: 'paysdelaloire',
    });
  }
}

export { PaysdelaloireOidcAuthenticationService };
