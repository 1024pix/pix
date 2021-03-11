import ApplicationAdapter from './application';

export default class MembershipAdapter extends ApplicationAdapter {

  urlForQuery(query) {
    if (query.filter.organizationId) {
      const { organizationId } = query.filter;
      delete query.filter.organizationId;

      return `${this.host}/${this.namespace}/organizations/${organizationId}/memberships`;
    }
    return super.urlForQuery(...arguments);
  }

  updateRecord(store, type, snapshot) {
    if (snapshot.adapterOptions && snapshot.adapterOptions.disable) {
      const url = this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot) + '/disable';
      const data = this.serialize(snapshot);
      return this.ajax(url, 'POST', { data });
    }
    return super.updateRecord(...arguments);
  }
}
