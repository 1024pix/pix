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
    if (snapshot.adapterOptions && snapshot.adapterOptions.anonymizeUser) {
      const url = this.urlForUpdateRecord(snapshot.id) + '/anonymize';
      return this.ajax(url, 'POST');
    }
    return super.updateRecord(...arguments);
  }
}
