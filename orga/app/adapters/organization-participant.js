import ApplicationAdapter from './application';

export default class OrganizationParticipantAdapter extends ApplicationAdapter {
  urlForQuery(query) {
    const { organizationId } = query.filter;
    delete query.filter.organizationId;

    return `${this.host}/${this.namespace}/organizations/${organizationId}/participants`;
  }

  addOralizationFeatureForParticipant(learnerId, organizationId) {
    const url = `${this.host}/${this.namespace}/organizations/${organizationId}/organization-learners/${learnerId}/features/ORALIZATION`;
    return this.ajax(url, 'POST');
  }

  removeOralizationFeatureForParticipant(learnerId, organizationId) {
    const url = `${this.host}/${this.namespace}/organizations/${organizationId}/organization-learners/${learnerId}/features/ORALIZATION`;
    return this.ajax(url, 'DELETE');
  }

  deleteParticipants(organizationId, ids) {
    const url = `${this.host}/${this.namespace}/organizations/${organizationId}/organization-learners`;
    return this.ajax(url, 'DELETE', { data: { listLearners: ids } });
  }

  updateParticipantName(organizationId, learnerId, firstName, lastName) {
    const url = `${this.host}/${this.namespace}/organizations/${organizationId}/organization-learners/${learnerId}`;
    return this.ajax(url, 'PATCH', {
      data: {
        firstName,
        lastName,
      },
    });
  }
}
