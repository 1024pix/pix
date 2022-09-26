import ApplicationAdapter from './application';

export default class OrganizationMembershipAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForCreateRecord() {
    return `${this.host}/${this.namespace}/memberships`;
  }

  urlForUpdateRecord(id) {
    return `${this.host}/${this.namespace}/memberships/${id}`;
  }

  deleteRecord(store, type, snapshot) {
    if (snapshot.adapterOptions && snapshot.adapterOptions.disable) {
      const url = this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot) + '/disable';
      const data = this.serialize(snapshot);
      return this.ajax(url, 'POST', { data });
    }
    return super.deleteRecord(...arguments);
  }
}
