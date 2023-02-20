import settings from '../../../config';
import OidcAuthenticationService from './oidc-authentication-service';

class FwbOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      source: 'fwb',
      identityProvider: 'FWB',
      slug: 'fwb',
      organizationName: 'Fédération Wallonie-Bruxelles',
      hasLogoutUrl: false,
      jwtOptions: { expiresIn: settings.fwb.accessTokenLifespanMs / 1000 },
      clientSecret: settings.fwb.clientSecret,
      clientId: settings.fwb.clientId,
      tokenUrl: settings.fwb.tokenUrl,
      authenticationUrl: settings.fwb.authenticationUrl,
      authenticationUrlParameters: [{ key: 'scope', value: 'openid profile' }],
      userInfoUrl: settings.fwb.userInfoUrl,
    });
  }
}

export default FwbOidcAuthenticationService;
