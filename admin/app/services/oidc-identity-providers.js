import Service, { inject as service } from '@ember/service';

export default class OidcIdentityProviders extends Service {
  @service store;

  get list() {
    return this.store.peekAll('oidc-identity-provider').toArray();
  }

  async loadAllAvailableIdentityProviders() {
    const oidcIdentityProviders = await this.store.findAll('oidc-identity-provider');
    oidcIdentityProviders.map((oidcIdentityProvider) => (this[oidcIdentityProvider.id] = oidcIdentityProvider));
  }

  async loadReadyIdentityProviders() {
    const oidcIdentityProviders = await this.store.findAll('oidc-identity-provider', {
      adapterOptions: { readyIdentityProviders: true },
    });
    oidcIdentityProviders.map((oidcIdentityProvider) => (this[oidcIdentityProvider.id] = oidcIdentityProvider));
  }
}
