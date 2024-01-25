import { config } from '../../../../src/shared/config.js';

import { OidcAuthenticationService } from './oidc-authentication-service.js';
import { PAYSDELALOIRE } from '../../constants/oidc-identity-providers.js';

const configKey = PAYSDELALOIRE.configKey;

class PaysdelaloireOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      authenticationUrl: config.paysdelaloire.authenticationUrl,
      authenticationUrlParameters: [{ key: 'scope', value: 'openid profile' }],
      clientId: config.paysdelaloire.clientId,
      clientSecret: config.paysdelaloire.clientSecret,
      configKey,
      endSessionUrl: config.paysdelaloire.endSessionUrl,
      hasLogoutUrl: false,
      identityProvider: PAYSDELALOIRE.code,
      jwtOptions: { expiresIn: config.paysdelaloire.accessTokenLifespanMs / 1000 },
      organizationName: 'Pays de la Loire',
      postLogoutRedirectUri: config.paysdelaloire.postLogoutRedirectUri,
      slug: 'pays-de-la-loire',
      source: 'paysdelaloire',
      tokenUrl: config.paysdelaloire.tokenUrl,
      userInfoUrl: config.paysdelaloire.userInfoUrl,
    });
  }
}

export { PaysdelaloireOidcAuthenticationService };
