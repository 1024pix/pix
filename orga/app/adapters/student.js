import ApplicationAdapter from './application';

export default class StudentAdapter extends ApplicationAdapter {
  urlForQuery(query) {
    const { organizationId } = query.filter;
    delete query.filter.organizationId;

    return `${this.host}/${this.namespace}/organizations/${organizationId}/students`;
  }

  dissociateUser(student) {
    const url = `${this.host}/${this.namespace}/schooling-registration-user-associations/${student.id}`;
    return this.ajax(url, 'DELETE');
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
