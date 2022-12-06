import ApplicationAdapter from './application';

export default class OrganizationLearnerActivityAdapter extends ApplicationAdapter {
  urlForQueryRecord(query) {
    if (query.organizationLearnerId) {
      const { organizationLearnerId } = query;
      delete query.organizationLearnerId;
      return `${this.host}/${this.namespace}/organization-learners/${organizationLearnerId}/activity`;
    }
  }
}
