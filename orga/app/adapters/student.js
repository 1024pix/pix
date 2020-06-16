import ApplicationAdapter from './application';

export default class Student extends ApplicationAdapter {
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
        }
      }
    };

    const url = `${this.host}/${this.namespace}/schooling-registration-user-associations`;
    return this.ajax(url, 'DELETE', { data });
  }
}
