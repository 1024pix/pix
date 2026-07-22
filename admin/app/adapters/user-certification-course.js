import ApplicationAdapter from './application';

export default class UserCertificationCourseAdapter extends ApplicationAdapter {
  urlForQuery({ userId }) {
    return `${this.host}/${this.namespace}/users/${Number(userId)}/certification-courses`;
  }
}
