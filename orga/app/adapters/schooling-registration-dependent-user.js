import ApplicationAdapter from './application';

export default class SchoolingRegistrationDependentUserAdapter extends ApplicationAdapter {

  urlForCreateRecord() {
    return `${this.host}/${this.namespace}/schooling-registration-dependent-users/password-update`;
  }
}
