import ApplicationAdapter from './application';

export default class OrganizationPlaceAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForQuery(query) {
    const organizationId = query.organizationId;
    delete query.organizationId;
    return `${this.host}/${this.namespace}/organizations/${organizationId}/places`;
  }

  urlForCreateRecord(modelName, { adapterOptions }) {
    const { organizationId } = adapterOptions;
    return `${this.host}/${this.namespace}/organizations/${organizationId}/places`;
  }

  urlForDeleteRecord(id, modelName, { adapterOptions }) {
    const { organizationId } = adapterOptions;
    return `${this.host}/${this.namespace}/organizations/${organizationId}/places/${id}`;
  }
}
