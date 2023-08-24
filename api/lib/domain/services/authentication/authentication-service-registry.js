import { InvalidIdentityProviderError } from '../../errors.js';
import { PoleEmploiOidcAuthenticationService } from './pole-emploi-oidc-authentication-service.js';
import { CnavOidcAuthenticationService } from './cnav-oidc-authentication-service.js';
import { FwbOidcAuthenticationService } from './fwb-oidc-authentication-service.js';

const allOidcProviderServices = [
  new PoleEmploiOidcAuthenticationService(),
  new CnavOidcAuthenticationService(),
  new FwbOidcAuthenticationService(),
];

const readyOidcProviderServices = allOidcProviderServices.filter((oidcProvider) => oidcProvider.isReady);

function getReadyOidcProviderServices() {
  return readyOidcProviderServices;
}

function getAllOidcProviderServices() {
  return allOidcProviderServices;
}

function getOidcProviderServiceByCode(identityProvider) {
  const oidcProviderService = readyOidcProviderServices.find((service) => identityProvider === service.code);
  if (!oidcProviderService) {
    throw new InvalidIdentityProviderError(identityProvider);
  }

  return oidcProviderService;
}

export { getReadyOidcProviderServices, getOidcProviderServiceByCode, getAllOidcProviderServices };
