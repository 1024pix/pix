import ApplicationAdapter from './application';

export default class ExternalUserAuthenticationRequest extends ApplicationAdapter {
  buildURL() {
    return `${this.host}/${this.namespace}/oidc/user/`;
  }
}
