import ApplicationAdapter from './application';

export default class CertificationCenterInvitationAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForQuery(query) {
    const { certificationCenterId } = query.filter;
    delete query.filter.certificationCenterId;

    return `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/invitations`;
  }
}
