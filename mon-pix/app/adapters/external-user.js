import ApplicationAdapter from './application';

export default class ExternalUser extends ApplicationAdapter {

  urlForCreateRecord() {
    return `${this.host}/${this.namespace}/schooling-registration-dependent-users/external-user-token`;
  }

}
