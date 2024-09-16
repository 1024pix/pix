import ApplicationAdapter from './application';

export default class PlacesLotAdapter extends ApplicationAdapter {
  urlForQuery(query) {
    if (query.filter.organizationId) {
      const { organizationId } = query.filter;
      delete query.filter.organizationId;
      return `${this.host}/${this.namespace}/organizations/${organizationId}/places-lots`;
    }
    return super.urlForQuery(...arguments);
  }
}
