import { InvalidIdentityProviderError } from '../../errors.js';

class OidcAuthenticationServiceRegistry {
  #allOidcProviderServices = null;
  #readyOidcProviderServices = null;
  #readyOidcProviderServicesForPixAdmin = null;

  async configureReadyOidcProviderServices() {
    await Promise.allSettled(
      this.#readyOidcProviderServices.map((oidcProviderService) => oidcProviderService.createClient()),
    );
    await Promise.allSettled(
      this.#readyOidcProviderServicesForPixAdmin.map((oidcProviderService) => oidcProviderService.createClient()),
    );
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
