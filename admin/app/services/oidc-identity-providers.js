import Service, { service } from '@ember/service';

const PIX_APP_APPLICATION_NAME = 'app';

export default class OidcIdentityProviders extends Service {
  @service store;

  get list() {
    return [...this.store.peekAll('oidc-identity-provider')];
  }

  get hasIdentityProviders() {
    return this.list.length > 0;
  }

  get identityProvidersForPixApp() {
    return this.list.filter((identityProvider) => identityProvider.application == PIX_APP_APPLICATION_NAME);
  }

  findByCode(identityProviderCode) {
    return this.list.find((oidcProvider) => oidcProvider.code === identityProviderCode);
  }

  findBySlug(identityProviderSlug) {
    return this.list.find((oidcProvider) => oidcProvider.slug === identityProviderSlug);
  }

  async loadAllAvailableIdentityProviders() {
    await this.store.findAll('oidc-identity-provider');
  }

  async loadReadyIdentityProviders() {
    await this.store.findAll('oidc-identity-provider', {
      adapterOptions: { readyIdentityProviders: true },
    });
  }
}
