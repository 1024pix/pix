import ApplicationAdapter from './application';

export default class OrganizationImportDetailAdapter extends ApplicationAdapter {
  urlForQueryRecord(query) {
    const { organizationId } = query;
    delete query.organizationId;
    return `${this.host}/${this.namespace}/organizations/${organizationId}/import-information`;
  }
}
