import ApplicationAdapter from './application';

export default class MissionLearnerAdapter extends ApplicationAdapter {
  urlForQuery(query) {
    if (query.organizationId && query.missionId) {
      const { organizationId, missionId } = query;
      delete query.organizationId;
      delete query.missionId;
      return `${this.host}/${this.namespace}/organizations/${organizationId}/missions/${missionId}/learners`;
    }
    return super.urlForQuery(...arguments);
  }
}
