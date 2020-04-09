import ApplicationAdapter from './application';

export default class StudentDependentUser extends ApplicationAdapter {

  urlForCreateRecord() {
    return `${this.host}/${this.namespace}/schooling-registration-dependent-users/password-update`;
  }
}
