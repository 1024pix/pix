import ApplicationAdapter from './application';

export default class ScoOrganizationParticipantAdapter extends ApplicationAdapter {
  urlForQuery(query) {
    const { organizationId } = query.filter;
    delete query.filter.organizationId;

    return `${this.host}/${this.namespace}/organizations/${organizationId}/sco-participants`;
  }

  async resetOrganizationLearnersPassword({ fetch, fileSaver, organizationId, organizationLearnersIds, token }) {
    const url = `${this.host}/${this.namespace}/sco-organization-learners/passwords`;
    const payload = JSON.stringify(
      {
        data: {
          attributes: { 'organization-id': organizationId, 'organization-learners-id': organizationLearnersIds },
        },
      },
      null,
      2,
    );
    const request = fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: payload,
    });

    return fileSaver.save({ fetcher: () => request });
  }
}
