import { InvalidIdentityProviderError } from '../../errors.js';
import { PoleEmploiOidcAuthenticationService } from './pole-emploi-oidc-authentication-service.js';
import { CnavOidcAuthenticationService } from './cnav-oidc-authentication-service.js';
import { FwbOidcAuthenticationService } from './fwb-oidc-authentication-service.js';

const oidcProviderServiceMap = [
  new PoleEmploiOidcAuthenticationService(),
  new CnavOidcAuthenticationService(),
  new FwbOidcAuthenticationService(),
].reduce((accumulator, service) => {
  return {
    ...accumulator,
    [service.code]: service,
  };
}, {});

const oidcProviderServiceCodes = Object.keys(oidcProviderServiceMap);

function getOidcProviderServices() {
  return Object.values(oidcProviderServiceMap);
}

function getOidcProviderServiceByCode(identityProvider) {
  if (!oidcProviderServiceCodes.includes(identityProvider)) throw new InvalidIdentityProviderError(identityProvider);

  return oidcProviderServiceMap[identityProvider];
}

export { getOidcProviderServices, getOidcProviderServiceByCode };
