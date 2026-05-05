import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * Stubs the oidcIdentityProviders service.
 *
 * @param {Object} owner - The owner object.
 * @returns {Service} The stubbed oidcIdentityProviders service.
 */
export function stubOidcIdentityProvidersService(owner, { oidcIdentityProviders, featuredIdentityProviderCode } = {}) {
  class OidcProvidersServiceStub extends Service {
    @tracked isOidcProviderAuthenticationInProgress = false;

    constructor() {
      super();
      this.oidcIdentityProviders = oidcIdentityProviders || [];

      this.oidcIdentityProviders.forEach((oidcIdentityProvider) => {
        this[oidcIdentityProvider.id] = oidcIdentityProvider;
      });

      this.featuredIdentityProviderCode = featuredIdentityProviderCode;
    }

    load() {
      return Promise.resolve();
    }

    get list() {
      return this.oidcIdentityProviders;
    }

    get visibleIdentityProviders() {
      return this.list.filter((identityProvider) => identityProvider.isVisible);
    }

    get hasVisibleIdentityProviders() {
      return this.visibleIdentityProviders.length > 0;
    }

    findByCode(identityProviderCode) {
      return this.list.find((oidcProvider) => oidcProvider.code === identityProviderCode);
    }

    findBySlug(identityProviderSlug) {
      return this.list.find((oidcProvider) => oidcProvider.slug === identityProviderSlug);
    }
  }

  owner.unregister('service:oidcIdentityProviders');
  owner.register('service:oidcIdentityProviders', OidcProvidersServiceStub);
  return owner.lookup('service:oidcIdentityProviders');
}
