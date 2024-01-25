import { config } from '../../../config.js';
import { OidcAuthenticationService } from './oidc-authentication-service.js';
import { GOOGLE } from '../../constants/oidc-identity-providers.js';

const configKey = GOOGLE.configKey;

class GoogleOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      authenticationUrl: config.google.authenticationUrl,
      authenticationUrlParameters: [{ key: 'scope', value: 'openid profile' }],
      clientId: config.google.clientId,
      clientSecret: config.google.clientSecret,
      configKey,
      identityProvider: GOOGLE.code,
      jwtOptions: { expiresIn: config.google.accessTokenLifespanMs / 1000 },
      organizationName: 'Google',
      slug: 'google',
      source: 'google',
      tokenUrl: config.google.tokenUrl,
      userInfoUrl: config.google.userInfoUrl,
    });

    this.temporaryStorage = config.google.temporaryStorage;
  }
}

export { GoogleOidcAuthenticationService };
