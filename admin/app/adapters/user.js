import ApplicationAdapter from './application';

export default class UserAdapter extends ApplicationAdapter {

  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/admin/users/${id}`;
  }

  urlForQueryRecord(query) {
    if (query.me) {
      delete query.me;
      return `${super.urlForQueryRecord(...arguments)}/me`;
    }

    return super.urlForQueryRecord(...arguments);
  }
}
