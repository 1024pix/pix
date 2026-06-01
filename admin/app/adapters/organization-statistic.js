import ApplicationAdapter from './application';

export default class OrganizationStatisticsAdapter extends ApplicationAdapter {
  urlForQueryRecord(query) {
    const { organizationId } = query;
    delete query.organizationId;

    return `${this.host}/${this.namespace}/admin/organizations/${organizationId}/statistics`;
  }
}
