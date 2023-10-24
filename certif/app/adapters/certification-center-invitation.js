import ApplicationAdapter from './application';

export default class CertificationCenterInvitationAdapter extends ApplicationAdapter {
  urlForFindAll(modelName, { adapterOptions }) {
    const { certificationCenterId } = adapterOptions;

    return `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/invitations`;
  }

  urlForQueryRecord(query) {
    if (query.invitationId && query.code) {
      const { invitationId } = query;
      delete query.invitationId;

      return `${this.host}/${this.namespace}/certification-center-invitations/${invitationId}`;
    }
    return super.urlForQueryRecord(...arguments);
  }

  sendInvitations({ certificationCenterId, emails }) {
    const data = {
      data: {
        attributes: {
          emails,
        },
      },
    };

    const url = `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/invitations`;

    return this.ajax(url, 'POST', { data });
  }
}
