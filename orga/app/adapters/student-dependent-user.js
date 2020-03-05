import ApplicationAdapter from './application';

export default class StudentDependentUser extends ApplicationAdapter {
  urlForCreateRecord() {
    return `${this.host}/${this.namespace}/student-dependent-users/password-update`;
  }
}
