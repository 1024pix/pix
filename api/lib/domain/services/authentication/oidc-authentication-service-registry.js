import { ProSanteConnectOidcAuthenticationService } from '../../../../src/authentication/domain/services/pro-sante-connect-oidc-authentication.service.js';
import { InvalidIdentityProviderError } from '../../errors.js';
import { CnavOidcAuthenticationService } from './cnav-oidc-authentication-service.js';
import { FwbOidcAuthenticationService } from './fwb-oidc-authentication-service.js';
import { GoogleOidcAuthenticationService } from './google-oidc-authentication-service.js';
import { PaysdelaloireOidcAuthenticationService } from './paysdelaloire-oidc-authentication-service.js';
import { PoleEmploiOidcAuthenticationService } from './pole-emploi-oidc-authentication-service.js';

export class OidcAuthenticationServiceRegistry {
  #allOidcProviderServices = null;
  #readyOidcProviderServices = null;
  #readyOidcProviderServicesForPixAdmin = null;

  constructor(dependencies = {}) {
    this.oidcProviderRepository = dependencies.oidcProviderRepository;
  }

  async configureReadyOidcProviderServiceByCode(oidcProviderServiceCode) {
    const oidcProviderService = this.#allOidcProviderServices?.find(
      (oidcProviderService) => oidcProviderService.code === oidcProviderServiceCode,
    );

    if (!oidcProviderService) return;
    if (oidcProviderService.client) return;

    await oidcProviderService.createClient();
    return true;
  }

  getAllOidcProviderServices() {
    return this.#allOidcProviderServices;
  }

  getReadyOidcProviderServices() {
    return this.#readyOidcProviderServices;
  }

  getReadyOidcProviderServicesForPixAdmin() {
    return this.#readyOidcProviderServicesForPixAdmin;
  }

  getOidcProviderServiceByCode({ identityProviderCode, audience = 'app' }) {
    const services =
      audience === 'admin' ? this.#readyOidcProviderServicesForPixAdmin : this.#readyOidcProviderServices;
    const oidcProviderService = services.find((service) => identityProviderCode === service.code);

    if (!oidcProviderService) {
      throw new InvalidIdentityProviderError(identityProviderCode);
    }

    return oidcProviderService;
  }

  loadOidcProviderServices(oidcProviderServices) {
    if (this.#allOidcProviderServices) {
      return;
    }

    const defaultOidcProviderServices = [
      new CnavOidcAuthenticationService(),
      new FwbOidcAuthenticationService(),
      new GoogleOidcAuthenticationService(),
      new PaysdelaloireOidcAuthenticationService(),
      new PoleEmploiOidcAuthenticationService(),
      new ProSanteConnectOidcAuthenticationService(),
    ];

    this.#allOidcProviderServices = oidcProviderServices ?? defaultOidcProviderServices;
    this.#readyOidcProviderServices = this.#allOidcProviderServices.filter(
      (oidcProviderService) => oidcProviderService.isReady,
    );
    this.#readyOidcProviderServicesForPixAdmin = this.#allOidcProviderServices.filter(
      (oidcProviderService) => oidcProviderService.isReadyForPixAdmin,
    );
    return true;
  }
}
