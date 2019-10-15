import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  urlForCreateRecord(modelName, { adapterOptions }) {
    const { organizationInvitationId } = adapterOptions;

    return `${this.host}/${this.namespace}/organization-invitations/${organizationInvitationId}/response`;
  },

});
