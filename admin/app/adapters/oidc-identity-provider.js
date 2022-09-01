import ApplicationAdapter from './application';

export default class OidcIdentityProviderAdapter extends ApplicationAdapter {
  urlForFindAll() {
    return `${this.host}/${this.namespace}/oidc/identity-providers`;
  }
}
