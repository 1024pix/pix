import ApplicationAdapter from './application';

export default class CertificationCenterInvitationAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForFindAll(modelName, { adapterOptions }) {
    const { certificationCenterId } = adapterOptions;
    return `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/invitations`;
  }

  queryRecord(store, type, query) {
    if (query.certificationCenterId) {
      const url = `${this.host}/${this.namespace}/certification-centers/${query.certificationCenterId}/invitations`;
      return this.ajax(url, 'POST', {
        data: { data: { attributes: { email: query.email, language: query.language, role: query.role } } },
      });
    }

    return super.queryRecord(...arguments);
  }
}
