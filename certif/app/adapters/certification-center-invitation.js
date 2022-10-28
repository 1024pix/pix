import ApplicationAdapter from './application';

export default class CertificationCenterInvitationAdapter extends ApplicationAdapter {
  urlForQueryRecord(query) {
    if (query.invitationId && query.code) {
      const { invitationId } = query;
      delete query.invitationId;

      return `${this.host}/${this.namespace}/certification-center-invitations/${invitationId}`;
    }
    return super.urlForQueryRecord(...arguments);
  }
}
