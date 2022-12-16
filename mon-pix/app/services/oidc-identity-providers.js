import Service, { inject as service } from '@ember/service';

export default class OidcIdentityProviders extends Service {
  @service store;

  get list() {
    return this.store.peekAll('oidc-identity-provider').toArray();
  }

  getIdentityProviderNamesByAuthenticationMethods(methods) {
    const identityProviderCodes = methods.map(({ identityProvider }) => identityProvider);
    return this.list
      .filter((provider) => identityProviderCodes.includes(provider.code))
      .map((provider) => provider.organizationName);
  }

  async load() {
    const oidcIdentityProviders = await this.store.findAll('oidc-identity-provider');
    oidcIdentityProviders.map((oidcIdentityProvider) => (this[oidcIdentityProvider.id] = oidcIdentityProvider));
  }
}
