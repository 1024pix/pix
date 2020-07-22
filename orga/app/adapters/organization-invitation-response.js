import ApplicationAdapter from './application';

export default class OrganizationInvitationResponseAdapter extends ApplicationAdapter {
  urlForCreateRecord(modelName, { adapterOptions }) {
    const { organizationInvitationId } = adapterOptions;

    return `${this.host}/${this.namespace}/organization-invitations/${organizationInvitationId}/response`;
  }
}
