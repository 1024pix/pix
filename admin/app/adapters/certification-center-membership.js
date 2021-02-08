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
}
