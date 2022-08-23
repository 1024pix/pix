const PoleEmploiOidcAuthenticationService = require('../services/authentication/pole-emploi-oidc-authentication-service');
const CnavOidcAuthenticationService = require('../services/authentication/cnav-oidc-authentication-service');

module.exports = {
  POLE_EMPLOI: new PoleEmploiOidcAuthenticationService(),
  CNAV: new CnavOidcAuthenticationService(),
};
