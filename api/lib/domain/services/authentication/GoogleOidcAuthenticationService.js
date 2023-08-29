import { config } from '../../../config.js';
import { OidcAuthenticationService } from './oidc-authentication-service.js';
import { GOOGLE } from '../../constants/oidc-identity-providers.js';

const configKey = GOOGLE.configKey;

class GoogleOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      identityProvider: GOOGLE.code,
      configKey,
      source: 'google',
      slug: 'google',
      organizationName: 'Google',
      jwtOptions: { expiresIn: config.google.accessTokenLifespanMs / 1000 },
      clientSecret: config.google.clientSecret,
      clientId: config.google.clientId,
      tokenUrl: config.google.tokenUrl,
      authenticationUrl: config.google.authenticationUrl,
      authenticationUrlParameters: [{ key: 'scope', value: 'openid profile email' }],
      userInfoUrl: config.google.userInfoUrl,
    });

    this.temporaryStorage = config.google.temporaryStorage;
  }
}

export { GoogleOidcAuthenticationService };
