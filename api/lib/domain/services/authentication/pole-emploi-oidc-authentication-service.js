const settings = require('../../../config');
const constants = require('../../constants');
const OidcAuthenticationService = require('./oidc-authentication-service');

class PoleEmploiOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    const source = 'pole_emploi_connect';
    const identityProvider = constants.IDENTITY_PROVIDER.POLE_EMPLOI;
    const expirationDelaySeconds = settings.poleEmploi.accessTokenLifespanMs / 1000;
    const jwtOptions = { expiresIn: expirationDelaySeconds };
    const clientSecret = settings.poleEmploi.clientSecret;
    const clientId = settings.poleEmploi.clientId;
    const tokenUrl = settings.poleEmploi.tokenUrl;
    const authenticationUrl = settings.poleEmploi.authenticationUrl;
    const authenticationUrlParameters = [
      { key: 'realm', value: '/individu' },
      {
        key: 'scope',
        value: `application_${clientId} api_peconnect-individuv1 openid profile`,
      },
    ];

    super({
      source,
      identityProvider,
      jwtOptions,
      clientSecret,
      clientId,
      tokenUrl,
      authenticationUrl,
      authenticationUrlParameters,
    });
  }
}

module.exports = PoleEmploiOidcAuthenticationService;
