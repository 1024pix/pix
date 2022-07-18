const AuthenticationMethod = require('../../models/AuthenticationMethod');
const poleEmploiAuthenticationService = require('./pole-emploi-authentication-service');
const cnavAuthenticationService = require('./cnav-authentication-service');
const PoleEmploiOidcAuthenticationService = require('./pole-emploi-oidc-authentication-service');

const poleEmploiOidcAuthenticationService = new PoleEmploiOidcAuthenticationService();

function lookupAuthenticationService(identityProvider) {
  switch (identityProvider) {
    case AuthenticationMethod.identityProviders.POLE_EMPLOI:
      return {
        authenticationService: poleEmploiAuthenticationService,
        oidcAuthenticationService: poleEmploiOidcAuthenticationService,
      };
    case AuthenticationMethod.identityProviders.CNAV:
      return { authenticationService: cnavAuthenticationService };
    default:
      throw new Error();
  }
}

module.exports = {
  lookupAuthenticationService,
};
