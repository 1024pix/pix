import Service, { inject as service } from '@ember/service';
import isEmpty from 'lodash/isEmpty';

export default class OidcIdentityProviders extends Service {
  @service store;

  get list() {
    return this.store.peekAll('oidc-identity-provider').toArray();
  }

  async load() {
    const oidcIdentityProviders = await this.store.findAll('oidc-identity-provider');
    oidcIdentityProviders.map((oidcIdentityProvider) => (this[oidcIdentityProvider.id] = oidcIdentityProvider));
  }
}
