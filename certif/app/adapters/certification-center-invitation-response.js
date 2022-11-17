import ApplicationAdapter from './application';

export default class CertificationCenterInvitationResponseAdapter extends ApplicationAdapter {
  urlForCreateRecord(modelName, { adapterOptions }) {
    const { certificationCenterInvitationId } = adapterOptions;

    return `${this.host}/${this.namespace}/certification-center-invitations/${certificationCenterInvitationId}/accept`;
  }
}
