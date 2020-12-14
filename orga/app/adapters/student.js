import ApplicationAdapter from './application';

export default class StudentAdapter extends ApplicationAdapter {
  urlForQuery(query) {
    const { organizationId } = query.filter;
    delete query.filter.organizationId;

    return `${this.host}/${this.namespace}/organizations/${organizationId}/students`;
  }

  dissociateUser(model) {
    const data = {
      data: {
        attributes: {
          'schooling-registration-id': model.id,
        },
      },
    };

    const url = `${this.host}/${this.namespace}/schooling-registration-user-associations`;
    return this.ajax(url, 'DELETE', { data });
  }

  updateRecord(store, type, snapshot) {
    const { id, adapterOptions } = snapshot;

    if (adapterOptions.updateStudentNumber) {
      const { organizationId, studentNumber } = adapterOptions;
      const url = `${this.host}/${this.namespace}/organizations/${organizationId}/schooling-registration-user-associations/${id}`;
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
}
