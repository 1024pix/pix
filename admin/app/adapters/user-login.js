import ApplicationAdapter from './application';

export default class UserLoginAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForUpdateRecord(id) {
    return `${this.host}/${this.namespace}/users/${id}`;
  }

  updateRecord(store, type, snapshot) {
    if (snapshot.adapterOptions && snapshot.adapterOptions.unblockUserAccount) {
      const url = this.urlForUpdateRecord(snapshot.adapterOptions.userId) + '/unblock';
      return this.ajax(url, 'PUT');
    }

    return super.updateRecord(...arguments);
  }
}
