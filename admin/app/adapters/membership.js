import ApplicationAdapter from './application';

export default class MembershipAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  updateRecord(store, type, snapshot) {
    if (snapshot.adapterOptions && snapshot.adapterOptions.disable) {
      const url = this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot) + '/disable';
      const data = this.serialize(snapshot);
      return this.ajax(url, 'POST', { data });
    }
    return super.updateRecord(...arguments);
  }
}
