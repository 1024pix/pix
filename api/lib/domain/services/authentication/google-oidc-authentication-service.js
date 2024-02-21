import { config } from '../../../config.js';
import { OidcAuthenticationService } from './oidc-authentication-service.js';
import { GOOGLE } from '../../constants/oidc-identity-providers.js';

const configKey = GOOGLE.configKey;

class GoogleOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      authenticationUrl: config[configKey].authenticationUrl,
      clientId: config[configKey].clientId,
      clientSecret: config[configKey].clientSecret,
      configKey,
      identityProvider: GOOGLE.code,
      jwtOptions: { expiresIn: config[configKey].accessTokenLifespanMs / 1000 },
      organizationName: 'Google',
      slug: 'google',
      source: 'google',
      tokenUrl: config[configKey].tokenUrl,
      userInfoUrl: config[configKey].userInfoUrl,
    });

    this.temporaryStorage = config[configKey].temporaryStorage;
  }
}

export { GoogleOidcAuthenticationService };
