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
}
