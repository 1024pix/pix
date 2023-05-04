import * as PoleEmploiOidcAuthenticationService from '../services/authentication/pole-emploi-oidc-authentication-service.js';
import * as CnavOidcAuthenticationService from '../services/authentication/cnav-oidc-authentication-service.js';
import * as FwbOidcAuthenticationService from '../services/authentication/fwb-oidc-authentication-service.js';

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
  propertyPathsToPick: [...DEFAULT_PROPERTY_PATHS_TO_PICK, 'logoutUrl'],
  service: new FwbOidcAuthenticationService(),
};

export { POLE_EMPLOI, CNAV, FWB };
