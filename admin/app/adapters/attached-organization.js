import ApplicationAdapter from './application';

export default class AttachedOrganizationAdapter extends ApplicationAdapter {
  urlForQuery(query) {
    const { certificationCenterId } = query;
    delete query.certificationCenterId;
    return `${this.host}/${this.namespace}/admin/certification-centers/${certificationCenterId}/organizations`;
  }
}
