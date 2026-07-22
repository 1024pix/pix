import ApplicationAdapter from './application';

export default class AdminOrganizationLearnerAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForQuery() {
    return `${this.host}/${this.namespace}/organization-learners`;
  }
}
