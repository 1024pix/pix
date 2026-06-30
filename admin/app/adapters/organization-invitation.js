import ApplicationAdapter from './application';

export default class OrganizationInvitation extends ApplicationAdapter {
  urlForCreateRecord(modelName, { adapterOptions }) {
    const { organizationId } = adapterOptions;

    return `${this.host}/${this.namespace}/organizations/${organizationId}/invitations`;
  }

  urlForDeleteRecord(id, modelName, { adapterOptions }) {
    return `${this.host}/${this.namespace}/organizations/${adapterOptions.organizationId}/invitations/${adapterOptions.organizationInvitationId}`;
  }

  sendInvitation({ email, locale, role, organizationId }) {
    const url = `${this.host}/${this.namespace}/organizations/${organizationId}/invitations`;
    return this.ajax(url, 'POST', {
      data: { data: { attributes: { email, locale, role } } },
    });
  }
}
