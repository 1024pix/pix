const settings = require('../../../config');
const constants = require('../../constants');
const OidcAuthenticationService = require('./oidc-authentication-service');

class PoleEmploiOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    // todo : remove constants from constants file (enter value directly here)
    const source = constants.SOURCE.POLE_EMPLOI;
    const identityProvider = constants.IDENTITY_PROVIDER.POLE_EMPLOI;
    const expirationDelaySeconds = settings.poleEmploi.accessTokenLifespanMs / 1000;
    const jwtOptions = { expiresIn: expirationDelaySeconds };

    super({ source, identityProvider, jwtOptions });
  }
}

module.exports = PoleEmploiOidcAuthenticationService;
