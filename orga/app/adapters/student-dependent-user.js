import ApplicationAdapter from './application';

export default class StudentDependentUser extends ApplicationAdapter {
  urlForCreateRecord() {
    return `${this.host}/${this.namespace}/student-dependent-users/password-update`;
  }

  createRecord() {
    return super.createRecord(...arguments).then((response) => {
      response.data.type = 'student-dependent-user';
      return response;
    });
  }
}
