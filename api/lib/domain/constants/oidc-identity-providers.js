const PoleEmploiOidcAuthenticationService = require('../services/authentication/pole-emploi-oidc-authentication-service.js');
const CnavOidcAuthenticationService = require('../services/authentication/cnav-oidc-authentication-service.js');
const FwbOidcAuthenticationService = require('../services/authentication/fwb-oidc-authentication-service.js');

const DEFAULT_PROPERTY_PATHS_TO_PICK = ['clientId', 'authenticationUrl', 'userInfoUrl', 'tokenUrl', 'clientSecret'];

const POLE_EMPLOI = {
  configKey: 'poleEmploi',
  propertyPathsToPick: [...DEFAULT_PROPERTY_PATHS_TO_PICK, 'sendingUrl', 'logoutUrl', 'afterLogoutUrl'],
  service: new PoleEmploiOidcAuthenticationService(),
};
const CNAV = {
  configKey: 'cnav',
  propertyPathsToPick: DEFAULT_PROPERTY_PATHS_TO_PICK,
  service: new CnavOidcAuthenticationService(),
};
const FWB = {
  configKey: 'fwb',
  propertyPathsToPick: DEFAULT_PROPERTY_PATHS_TO_PICK,
  service: new FwbOidcAuthenticationService(),
};

module.exports = {
  POLE_EMPLOI,
  CNAV,
  FWB,
};
