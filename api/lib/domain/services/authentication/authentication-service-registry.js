const AuthenticationMethod = require('../../models/AuthenticationMethod');
const poleEmploiAuthenticationService = require('./pole-emploi-authentication-service');
const cnavAuthenticationService = require('./cnav-authentication-service');

function lookupAuthenticationService(identityProvider) {
  switch (identityProvider) {
    case AuthenticationMethod.identityProviders.POLE_EMPLOI:
      return poleEmploiAuthenticationService;
    case AuthenticationMethod.identityProviders.CNAV:
      return cnavAuthenticationService;
    default:
      throw new Error();
  }
}

module.exports = {
  lookupAuthenticationService,
};
