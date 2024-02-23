import { config } from '../../../config.js';
import { OidcAuthenticationService } from './oidc-authentication-service.js';
import { GOOGLE } from '../../constants/oidc-identity-providers.js';

const configKey = GOOGLE.configKey;

class GoogleOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      clientId: config[configKey].clientId,
      clientSecret: config[configKey].clientSecret,
      configKey,
      identityProvider: GOOGLE.code,
      jwtOptions: { expiresIn: config[configKey].accessTokenLifespanMs / 1000 },
      openidConfigurationUrl: config[configKey].openidConfigurationUrl,
      organizationName: 'Google',
      redirectUri: config[configKey].redirectUri,
      slug: 'google',
      source: 'google',
    });

    this.temporaryStorage = config[configKey].temporaryStorage;
  }
}

export { GoogleOidcAuthenticationService };
