import { InvalidIdentityProviderError } from '../../errors.js';
import { CnavOidcAuthenticationService } from './cnav-oidc-authentication-service.js';
import { FwbOidcAuthenticationService } from './fwb-oidc-authentication-service.js';
import { PoleEmploiOidcAuthenticationService } from './pole-emploi-oidc-authentication-service.js';

const oidcProviderServices = [
  new PoleEmploiOidcAuthenticationService(),
  new CnavOidcAuthenticationService(),
  new FwbOidcAuthenticationService(),
].filter((oidcProvider) => oidcProvider.isReady);

const oidcProviderServiceMap = oidcProviderServices.reduce(_associateServiceToCode, {});
function _associateServiceToCode(map, service) {
  return {
    ...map,
    [service.code]: service,
  };
}

const oidcProviderServiceCodes = Object.keys(oidcProviderServiceMap);

function getOidcProviderServices() {
  return Object.values(oidcProviderServiceMap);
}

function getOidcProviderServiceByCode(identityProvider) {
  if (!oidcProviderServiceCodes.includes(identityProvider)) throw new InvalidIdentityProviderError(identityProvider);

  return oidcProviderServiceMap[identityProvider];
}

export { getOidcProviderServiceByCode, getOidcProviderServices };
