import ApplicationAdapter from './application';

export default class CertificationCenterMembershipAdapter extends ApplicationAdapter {

  urlForQuery(query) {
    if (query.filter.certificationCenterId) {
      const { certificationCenterId } = query.filter;
      delete query.filter.certificationCenterId;

      return `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/certification-center-memberships`;
    }
    return super.urlForQuery(...arguments);
  }

  createRecord(store, type, snapshot) {
    const { adapterOptions } = snapshot;

    if (adapterOptions && adapterOptions.createByEmail) {
      const { certificationCenterId, email } = adapterOptions;
      delete adapterOptions.certificationCenterId;
      delete adapterOptions.createByEmail;
      delete adapterOptions.email;

      const url = `${this.buildURL('certification-center', certificationCenterId)}/certification-center-memberships`;
      const payload = { data: { email } };

      return this.ajax(url, 'POST', payload);
    }

    return super.createRecord(...arguments);
  }
}
