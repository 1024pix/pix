import ApplicationAdapter from './application';

export default class UserAdapter extends ApplicationAdapter {

  urlForQueryRecord(query) {
    if (query.me) {
      delete query.me;
      return `${super.urlForQueryRecord(...arguments)}/me`;
    }

    return super.urlForQueryRecord(...arguments);
  }

  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/admin/users/${id}`;
  }

  urlForUpdateRecord(id) {
    return `${this.host}/${this.namespace}/admin/users/${id}`;
  }

  updateRecord(store, type, snapshot) {
    if (snapshot.adapterOptions && snapshot.adapterOptions.disableUser) {
      const url = this.urlForUpdateRecord(snapshot.id) + '/disable';
      return this.ajax(url, 'POST');
    }

    if (snapshot.adapterOptions && snapshot.adapterOptions.dissociate) {
      const url = this.urlForUpdateRecord(snapshot.id) + '/dissociate';
      return this.ajax(url, 'PATCH');
    }

    return super.updateRecord(...arguments);
  }
}
