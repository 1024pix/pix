import { InvalidIdentityProviderError } from '../../errors.js';
import { PoleEmploiOidcAuthenticationService } from './pole-emploi-oidc-authentication-service.js';
import { CnavOidcAuthenticationService } from './cnav-oidc-authentication-service.js';
import { FwbOidcAuthenticationService } from './fwb-oidc-authentication-service.js';

const oidcProviderServices = [
  new PoleEmploiOidcAuthenticationService(),
  new CnavOidcAuthenticationService(),
  new FwbOidcAuthenticationService(),
].filter((oidcProvider) => oidcProvider.isReady);

function getReadyOidcProviderServices() {
  return oidcProviderServices;
}

function getOidcProviderServiceByCode(identityProvider) {
  const oidcProviderService = oidcProviderServices.find((service) => identityProvider === service.code);
  if (!oidcProviderService) {
    throw new InvalidIdentityProviderError(identityProvider);
  }

  return oidcProviderService;
}

export { getReadyOidcProviderServices, getOidcProviderServiceByCode };
