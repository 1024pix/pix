import ApplicationAdapter from './application';

export default class OrganizationLearnerAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForDeleteRecord(id) {
    return `${this.host}/${this.namespace}/organization-learners/${id}/association`;
  }
}
