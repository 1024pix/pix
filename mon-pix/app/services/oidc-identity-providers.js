import Service, { inject as service } from '@ember/service';
import isEmpty from 'lodash/isEmpty';

export default class OidcIdentityProviders extends Service {
  @service store;

  get list() {
    return this.store.peekAll('oidc-identity-provider');
  }

  getIdentityProviderNamesByAuthenticationMethods(methods) {
    const identityProviderCodes = methods.map(({ identityProvider }) => identityProvider);
    return this.list
      .filter((provider) => identityProviderCodes.includes(provider.code))
      .map((provider) => provider.organizationName);
  }

  isFwbActivated() {
    const identityProviderSlug = 'fwb';
    const oidcIdentityProviders = this.list.filter((provider) => provider.id === identityProviderSlug);
    return !isEmpty(oidcIdentityProviders);
  }

  async load() {
    const oidcIdentityProviders = await this.store.findAll('oidc-identity-provider');
    oidcIdentityProviders.map((oidcIdentityProvider) => (this[oidcIdentityProvider.id] = oidcIdentityProvider));
  }
}
