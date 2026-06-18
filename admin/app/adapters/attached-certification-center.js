import ApplicationAdapter from './application';

export default class AttachedCertificationCenterAdapter extends ApplicationAdapter {
  urlForQuery(query) {
    const { organizationId } = query;
    delete query.organizationId;
    return `${this.host}/${this.namespace}/admin/organizations/${organizationId}/certification-centers`;
  }
}
