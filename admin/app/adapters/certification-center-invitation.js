import ApplicationAdapter from './application';

export default class CertificationCenterInvitationAdapter extends ApplicationAdapter {
  queryRecord(store, type, query) {
    if (query.certificationCenterId) {
      const url = `${this.host}/${this.namespace}/certification-centers/${query.certificationCenterId}/invitations`;
      return this.ajax(url, 'POST', {
        data: { data: { attributes: { email: query.email, locale: query.locale, role: query.role } } },
      });
    }

    return super.queryRecord(...arguments);
  }
}
