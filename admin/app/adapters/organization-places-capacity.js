import ApplicationAdapter from './application';

export default class OrganizationPlacesCapacityAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForQueryRecord(query) {
    const organizationId = query.organizationId;
    delete query.organizationId;
    return `${this.host}/${this.namespace}/organizations/${organizationId}/places/capacity`;
  }
}
