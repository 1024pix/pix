import ApplicationAdapter from './application';

export default class OrganizationLearnerAdapter extends ApplicationAdapter {
  urlForDeleteRecord(id, _, snapshot) {
    return `${this.host}/${this.namespace}/organizations/${snapshot.attr('organizationId')}/organization-learners/${id}`;
  }

  dissociate(id) {
    const url = `${this.host}/${this.namespace}/organization-learners/${id}/association`;
    return this.ajax(url, 'DELETE');
  }
}
