import ApplicationAdapter from './application';

export default class SupOrganizationParticipantAdapter extends ApplicationAdapter {
  urlForQuery(query) {
    const { organizationId } = query.filter;
    delete query.filter.organizationId;

    return `${this.host}/${this.namespace}/organizations/${organizationId}/sup-participants`;
  }

  updateRecord(store, type, snapshot) {
    const { id, adapterOptions } = snapshot;

    if (adapterOptions.updateStudentNumber) {
      const { organizationId, studentNumber } = adapterOptions;
      const url = `${this.host}/${this.namespace}/organizations/${organizationId}/sup-organization-learners/${id}`;
      const data = {
        data: {
          attributes: {
            'student-number': studentNumber,
          },
        },
      };
      return this.ajax(url, 'PATCH', { data });
    }

    return super.updateRecord(store, type, snapshot);
  }

  deleteParticipants(organizationId, ids) {
    const url = `${this.host}/${this.namespace}/organizations/${organizationId}/organization-learners`;
    return this.ajax(url, 'DELETE', { data: { listLearners: ids } });
  }
}
