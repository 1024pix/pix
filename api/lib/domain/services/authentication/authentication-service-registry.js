import { InvalidIdentityProviderError } from '../../errors.js';
import { PoleEmploiOidcAuthenticationService } from './pole-emploi-oidc-authentication-service.js';
import { CnavOidcAuthenticationService } from './cnav-oidc-authentication-service.js';
import { FwbOidcAuthenticationService } from './fwb-oidc-authentication-service.js';

const OidcProviderServiceMap = [
  new PoleEmploiOidcAuthenticationService(),
  new CnavOidcAuthenticationService(),
  new FwbOidcAuthenticationService(),
].reduce((accumulator, service) => {
  return {
    ...accumulator,
    [service.code]: service,
  };
}, {});

const OidcProviderServiceCodes = Object.keys(OidcProviderServiceMap);

function getOidcProviderServices() {
  return Object.values(OidcProviderServiceMap);
}

function getOidcProviderServiceByCode(identityProvider) {
  if (!OidcProviderServiceCodes.includes(identityProvider)) throw new InvalidIdentityProviderError(identityProvider);

  return OidcProviderServiceMap[identityProvider];
}

export { getOidcProviderServices, getOidcProviderServiceByCode };
