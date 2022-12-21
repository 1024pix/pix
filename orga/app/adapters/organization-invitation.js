import ApplicationAdapter from './application';

export default class OrganizationInvitationAdapter extends ApplicationAdapter {
  urlForDeleteRecord(id, modelName, { adapterOptions }) {
    return `${this.host}/${this.namespace}/organizations/${adapterOptions.organizationId}/invitations/${adapterOptions.organizationInvitationId}`;
  }

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

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    if (adapterOptions && adapterOptions.resendInvitation) {
      const { organizationId } = adapterOptions;
      return `${this.host}/${this.namespace}/organizations/${organizationId}/resend-invitation`;
    }
    return super.urlForUpdateRecord(...arguments);
  }

  createRecord() {
    return super.createRecord(...arguments).then((response) => {
      response.data = response.data[0];
      return response;
    });
  }
}
