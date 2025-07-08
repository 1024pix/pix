import ApplicationAdapter from './application';

export default class OidcIdentityProviderAdapter extends ApplicationAdapter {
  urlForFindAll(_, snapshot) {
    if (snapshot.adapterOptions?.readyIdentityProviders) {
      return `${this.host}/${this.namespace}/oidc/identity-providers`;
    }
    return `${this.host}/${this.namespace}/admin/oidc/identity-providers`;
  }
}
