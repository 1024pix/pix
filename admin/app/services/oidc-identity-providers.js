import Service, { inject as service } from '@ember/service';

export default class OidcIdentityProviders extends Service {
  @service store;

  get list() {
    return this.store.peekAll('oidc-identity-provider').toArray();
  }

  async loadAllAvailableIdentityProviders() {
    await this.store.findAll('oidc-identity-provider');
  }

  async loadReadyIdentityProviders() {
    await this.store.findAll('oidc-identity-provider', {
      adapterOptions: { readyIdentityProviders: true },
    });
  }

  isProviderEnabled(identityProviderSlug) {
    const oidcIdentityProvider = this.list.find((provider) => provider.id === identityProviderSlug);
    return oidcIdentityProvider !== undefined;
  }
}
