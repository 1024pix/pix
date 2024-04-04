import jsonwebtoken from 'jsonwebtoken';

import { OidcAuthenticationService } from '../../../../src/authentication/domain/services/oidc-authentication-service.js';
import { config } from '../../../config.js';
import { GOOGLE } from '../../constants/oidc-identity-providers.js';

const configKey = GOOGLE.configKey;

class GoogleOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      accessTokenLifespanMs: config[configKey].accessTokenLifespanMs,
      clientId: config[configKey].clientId,
      clientSecret: config[configKey].clientSecret,
      configKey,
      identityProvider: GOOGLE.code,
      openidConfigurationUrl: config[configKey].openidConfigurationUrl,
      organizationName: 'Google',
      redirectUri: config[configKey].redirectUri,
      slug: 'google',
      source: 'google',
      scope: 'openid profile email',
    });

    this.temporaryStorage = config[configKey].temporaryStorage;
  }

  async getUserInfo({ idToken }) {
    const userInfo = jsonwebtoken.decode(idToken);

    return {
      externalIdentityId: userInfo.sub,
      email: userInfo.email,
    };
  }
}

export { GoogleOidcAuthenticationService };
