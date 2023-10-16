import { config } from '../../../../src/shared/config.js';

import { OidcAuthenticationService } from './oidc-authentication-service.js';
import { PAYSDELALOIRE } from '../../constants/oidc-identity-providers.js';

const configKey = PAYSDELALOIRE.configKey;

class PaysdelaloireOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      identityProvider: PAYSDELALOIRE.code,
      configKey,
      source: 'paysdelaloire',
      slug: 'pays-de-la-loire',
      organizationName: 'Pays de la Loire',
      hasLogoutUrl: false,
      jwtOptions: { expiresIn: config.paysdelaloire.accessTokenLifespanMs / 1000 },
      clientSecret: config.paysdelaloire.clientSecret,
      clientId: config.paysdelaloire.clientId,
      tokenUrl: config.paysdelaloire.tokenUrl,
      authenticationUrl: config.paysdelaloire.authenticationUrl,
      authenticationUrlParameters: [{ key: 'scope', value: 'openid profile' }],
      userInfoUrl: config.paysdelaloire.userInfoUrl,
      endSessionUrl: config.paysdelaloire.endSessionUrl,
      postLogoutRedirectUri: config.paysdelaloire.postLogoutRedirectUri,
    });
  }
}

export { PaysdelaloireOidcAuthenticationService };
