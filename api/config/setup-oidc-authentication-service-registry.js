import { CnavOidcAuthenticationService } from '../lib/domain/services/authentication/cnav-oidc-authentication-service.js';
import { FwbOidcAuthenticationService } from '../lib/domain/services/authentication/fwb-oidc-authentication-service.js';
import { GoogleOidcAuthenticationService } from '../lib/domain/services/authentication/google-oidc-authentication-service.js';
import { oidcAuthenticationServiceRegistry } from '../lib/domain/services/authentication/oidc-authentication-service-registry.js';
import { PaysdelaloireOidcAuthenticationService } from '../lib/domain/services/authentication/paysdelaloire-oidc-authentication-service.js';
import { PoleEmploiOidcAuthenticationService } from '../lib/domain/services/authentication/pole-emploi-oidc-authentication-service.js';
import { logger } from '../src/shared/infrastructure/utils/logger.js';

async function setupOidcAuthenticationServiceRegistry(oidcProviderServices) {
  logger.info('Configuring and loading OIDC Provider services …');

  const defaultOidcProviderServices = [
    new CnavOidcAuthenticationService(),
    new FwbOidcAuthenticationService(),
    new GoogleOidcAuthenticationService(),
    new PaysdelaloireOidcAuthenticationService(),
    new PoleEmploiOidcAuthenticationService(),
  ];
  const availableOidcProviderServices = oidcProviderServices ?? defaultOidcProviderServices;

  oidcAuthenticationServiceRegistry.loadOidcProviderServices(availableOidcProviderServices);
  await oidcAuthenticationServiceRegistry.configureReadyOidcProviderServices();

  logger.info('OIDC Provider services configuration and loading done');
}

export { setupOidcAuthenticationServiceRegistry };
