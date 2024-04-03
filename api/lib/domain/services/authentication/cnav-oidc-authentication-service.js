import { OidcAuthenticationService } from '../../../../src/authentication/domain/services/oidc-authentication-service.js';
import { config } from '../../../config.js';
import { CNAV } from '../../constants/oidc-identity-providers.js';

const configKey = CNAV.configKey;

class CnavOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      accessTokenLifespanMs: config[configKey].accessTokenLifespanMs,
      clientId: config[configKey].clientId,
      clientSecret: config[configKey].clientSecret,
      configKey,
      extraAuthorizationUrlParameters: { RedirectToIdentityProvider: 'AD+Authority' },
      identityProvider: CNAV.code,
      openidConfigurationUrl: config[configKey].openidConfigurationUrl,
      organizationName: 'CNAV',
      redirectUri: config[configKey].redirectUri,
      slug: 'cnav',
      source: 'cnav',
    });
  }
}

export { CnavOidcAuthenticationService };
