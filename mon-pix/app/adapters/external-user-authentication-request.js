import ApplicationAdapter from './application';

export default class ExternalUserAuthenticationRequest extends ApplicationAdapter {

  urlForCreateRecord() {
    return `${this.host}/${this.namespace}/token-from-external-user`;
  }
}
