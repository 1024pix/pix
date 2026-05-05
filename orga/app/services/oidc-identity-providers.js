import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class OidcIdentityProviders extends Service {
  @service store;

  @tracked isOidcProviderAuthenticationInProgress = false;

  async load() {
    await this.store.findAll('oidc-identity-provider');
  }

  get list() {
    return this.store.peekAll('oidc-identity-provider');
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

  getIdentityProviderNamesByAuthenticationMethods(methods) {
    const identityProviderCodes = methods.map(({ identityProvider }) => identityProvider);
    return this.list
      .filter((provider) => identityProviderCodes.includes(provider.code))
      .map((provider) => provider.organizationName);
  }
}
