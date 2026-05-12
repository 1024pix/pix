import Service from '@ember/service';

/**
 * Stubs the oidcIdentityProviders service.
 *
 * @param {Object} owner - The owner object.
 * @returns {Service} The stubbed oidcIdentityProviders service.
 */
export function stubOidcIdentityProvidersService(
  owner,
  { oidcIdentityProviders = [], hostWithoutApplicationNorTld = 'pix' } = {},
) {
  class OidcProvidersServiceStub extends Service {
    constructor() {
      super();
      this.oidcIdentityProviders = oidcIdentityProviders.map((oidcIdentityProvider) => {
        const oidcIdentityProviderModel = Object.assign(
          {
            contextualizedName: `${oidcIdentityProvider.organizationName} – ${oidcIdentityProvider.application}.${hostWithoutApplicationNorTld}${oidcIdentityProvider.applicationTld}`,
          },
          oidcIdentityProvider,
        );

        this[oidcIdentityProvider.id] = oidcIdentityProviderModel;

        return oidcIdentityProviderModel;
      });
    }

    get list() {
      return this.oidcIdentityProviders;
    }

    get hasIdentityProviders() {
      return this.oidcIdentityProviders.length > 0;
    }

    findByCode(identityProviderCode) {
      return this.list.find((oidcProvider) => oidcProvider.code === identityProviderCode);
    }

    findBySlug(identityProviderSlug) {
      return this.list.find((oidcProvider) => oidcProvider.slug === identityProviderSlug);
    }

    loadAllAvailableIdentityProviders() {
      return Promise.resolve();
    }

    loadReadyIdentityProviders() {
      return Promise.resolve();
    }
  }

  owner.unregister('service:oidcIdentityProviders');
  owner.register('service:oidcIdentityProviders', OidcProvidersServiceStub);
  return owner.lookup('service:oidcIdentityProviders');
}
