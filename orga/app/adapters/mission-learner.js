import ApplicationAdapter from './application';

export default class MissionAdapter extends ApplicationAdapter {
  urlForQuery(query) {
    if (query.organizationId) {
      const { organizationId } = query;
      delete query.organizationId;
      return `${this.host}/${this.namespace}/organizations/${organizationId}/mission-learners`;
    }
    return super.urlForQuery(...arguments);
  }
}
