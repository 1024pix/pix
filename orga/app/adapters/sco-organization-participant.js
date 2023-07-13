import ApplicationAdapter from './application';

export default class ScoOrganizationParticipantAdapter extends ApplicationAdapter {
  urlForQuery(query) {
    const { organizationId } = query.filter;
    delete query.filter.organizationId;

    return `${this.host}/${this.namespace}/organizations/${organizationId}/sco-participants`;
  }

  resetOrganizationLearnersPassword(organizationId, organizationLearnersIds) {
    const url = `${this.host}/${this.namespace}/sco-organization-learners/passwords`;
    return this.ajax(url, 'PUT', {
      data: {
        data: {
          attributes: { 'organization-id': organizationId, 'organization-learners-id': organizationLearnersIds },
        },
      },
    });
  }
}
