import ApplicationAdapter from './application';

export default class OrganizationInvitation extends ApplicationAdapter {
  urlForCreateRecord(modelName, { adapterOptions }) {
    const { organizationId } = adapterOptions;

    return `${this.host}/${this.namespace}/organizations/${organizationId}/invitations`;
  }

  urlForQueryRecord(query) {
    if (query.invitationId && query.code) {
      const { invitationId } = query;
      delete query.invitationId;

      return `${this.host}/${this.namespace}/organization-invitations/${invitationId}`;
    }
    return super.urlForQueryRecord(...arguments);
  }

  createRecord() {
    return super.createRecord(...arguments).then((response) => {
      response.data = response.data[0];
      return response;
    });
  }
}
