import ApplicationAdapter from './application';

const PIX_ADMIN_AUDIENCE = 'admin';

export default class OidcIdentityProviderAdapter extends ApplicationAdapter {
  urlForFindAll(_, snapshot) {
    if (snapshot.adapterOptions?.readyIdentityProviders) {
      return `${this.host}/${this.namespace}/oidc/identity-providers?audience=${PIX_ADMIN_AUDIENCE}`;
    }
    return `${this.host}/${this.namespace}/admin/oidc/identity-providers`;
  }
}
