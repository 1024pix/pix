import PoleEmploiOidcAuthenticationService from '../services/authentication/pole-emploi-oidc-authentication-service';
import CnavOidcAuthenticationService from '../services/authentication/cnav-oidc-authentication-service';
import FwbOidcAuthenticationService from '../services/authentication/fwb-oidc-authentication-service';

const DEFAULT_PROPERTY_PATHS_TO_PICK = ['clientId', 'authenticationUrl', 'userInfoUrl', 'tokenUrl', 'clientSecret'];

export default {
  POLE_EMPLOI: {
    configKey: 'poleEmploi',
    propertyPathsToPick: [...DEFAULT_PROPERTY_PATHS_TO_PICK, 'sendingUrl', 'logoutUrl', 'afterLogoutUrl'],
    service: new PoleEmploiOidcAuthenticationService(),
  },
  CNAV: {
    configKey: 'cnav',
    propertyPathsToPick: DEFAULT_PROPERTY_PATHS_TO_PICK,
    service: new CnavOidcAuthenticationService(),
  },
  FWB: {
    configKey: 'fwb',
    propertyPathsToPick: DEFAULT_PROPERTY_PATHS_TO_PICK,
    service: new FwbOidcAuthenticationService(),
  },
};
