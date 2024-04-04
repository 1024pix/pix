import { OidcAuthenticationService } from '../../../../src/authentication/domain/services/oidc-authentication-service.js';
import { config } from '../../../../src/shared/config.js';
import { PAYSDELALOIRE } from '../../constants/oidc-identity-providers.js';

const configKey = PAYSDELALOIRE.configKey;

class PaysdelaloireOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      accessTokenLifespanMs: config[configKey].accessTokenLifespanMs,
      clientId: config[configKey].clientId,
      clientSecret: config[configKey].clientSecret,
      configKey,
      shouldCloseSession: true,
      identityProvider: PAYSDELALOIRE.code,
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
