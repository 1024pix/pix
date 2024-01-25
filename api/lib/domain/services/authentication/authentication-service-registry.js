import { InvalidIdentityProviderError } from '../../errors.js';

class OidcAuthenticationServiceRegistry {
  #allOidcProviderServices = null;
  #readyOidcProviderServices = null;
  #readyOidcProviderServicesForPixAdmin = null;

  getAllOidcProviderServices() {
    return this.#allOidcProviderServices;
  }

  getReadyOidcProviderServices() {
    return this.#readyOidcProviderServices;
  }

  getReadyOidcProviderServicesForPixAdmin() {
    return this.#readyOidcProviderServicesForPixAdmin;
  }

  getOidcProviderServiceByCode(identityProviderCode) {
    const oidcProviderService = this.#readyOidcProviderServices.find(
      (service) => identityProviderCode === service.code,
    );

    if (!oidcProviderService) {
      throw new InvalidIdentityProviderError(identityProviderCode);
    }

    return oidcProviderService;
  }

  loadOidcProviderServices(oidcProviderServices) {
    this.#allOidcProviderServices = oidcProviderServices;
    this.#readyOidcProviderServices = this.#allOidcProviderServices.filter(
      (oidcProviderService) => oidcProviderService.isReady,
    );
    this.#readyOidcProviderServicesForPixAdmin = this.#allOidcProviderServices.filter(
      (oidcProviderService) => oidcProviderService.isReadyForPixAdmin,
    );
  }
}

const oidcAuthenticationServiceRegistry = new OidcAuthenticationServiceRegistry();

export { oidcAuthenticationServiceRegistry };
