import { InvalidIdentityProviderError } from '../../errors.js';
import { PoleEmploiOidcAuthenticationService } from './pole-emploi-oidc-authentication-service.js';
import { CnavOidcAuthenticationService } from './cnav-oidc-authentication-service.js';
import { FwbOidcAuthenticationService } from './fwb-oidc-authentication-service.js';
import { PaysdelaloireOidcAuthenticationService } from './paysdelaloire-oidc-authentication-service.js';
import { GoogleOidcAuthenticationService } from './GoogleOidcAuthenticationService.js';

const allOidcProviderServices = [
  new PoleEmploiOidcAuthenticationService(),
  new CnavOidcAuthenticationService(),
  new FwbOidcAuthenticationService(),
  new PaysdelaloireOidcAuthenticationService(),
  new GoogleOidcAuthenticationService(),
];

const readyOidcProviderServices = allOidcProviderServices.filter((oidcProvider) => oidcProvider.isReady);
const readyOidcProviderServicesForPixAdmin = allOidcProviderServices.filter(
  (oidcProvider) => oidcProvider.isReadyForPixAdmin,
);

function getReadyOidcProviderServices() {
  return readyOidcProviderServices;
}

function getReadyOidcProviderServicesForPixAdmin() {
  return readyOidcProviderServicesForPixAdmin;
}

function getAllOidcProviderServices() {
  return allOidcProviderServices;
}

function getOidcProviderServiceByCode(identityProvider, source = 'pix-app') {
  let oidcProviderService;

  if (source === 'pix-admin') {
    oidcProviderService = getReadyOidcProviderServicesForPixAdmin().find(
      (service) => identityProvider === service.code,
    );
  } else {
    oidcProviderService = readyOidcProviderServices.find((service) => identityProvider === service.code);
  }

  if (!oidcProviderService) {
    throw new InvalidIdentityProviderError(identityProvider);
  }

  return oidcProviderService;
}

export {
  getReadyOidcProviderServices,
  getReadyOidcProviderServicesForPixAdmin,
  getOidcProviderServiceByCode,
  getAllOidcProviderServices,
};
