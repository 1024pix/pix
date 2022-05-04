import ApplicationAdapter from './application';

export default class AdminMemberAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForQueryRecord(query) {
    if (query.me) {
      delete query.me;
      return `${this.host}/${this.namespace}/admin-members/me`;
    }

    return super.urlForQueryRecord(...arguments);
  }
}
