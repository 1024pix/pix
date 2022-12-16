import ApplicationAdapter from './application';

export default class OrganizationInvitation extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForCreateRecord(modelName, { adapterOptions }) {
    const { organizationId } = adapterOptions;

    return `${this.host}/${this.namespace}/organizations/${organizationId}/invitations`;
  }

  urlForFindAll(modelName, { adapterOptions }) {
    const { organizationId } = adapterOptions;
    return `${this.host}/${this.namespace}/organizations/${organizationId}/invitations`;
  }

  urlForDeleteRecord(id, modelName, { adapterOptions }) {
    return `${this.host}/${this.namespace}/organizations/${adapterOptions.organizationId}/invitations/${adapterOptions.organizationInvitationId}`;
  }

  createRecord() {
    return super.createRecord(...arguments).then((response) => {
      response.data = response.data[0];
      return response;
    });
  }

  queryRecord(store, type, query) {
    if (query.organizationId) {
      const url = `${this.host}/${this.namespace}/organizations/${query.organizationId}/invitations`;
      return this.ajax(url, 'POST', {
        data: { data: { attributes: { email: query.email, lang: query.lang, role: query.role } } },
      });
    }

    return super.queryRecord(...arguments);
  }
}
