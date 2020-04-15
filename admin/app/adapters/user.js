import ApplicationAdapter from './application';

export default class UserAdapter extends ApplicationAdapter {

  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/admin/users/${id}`;
  }
}
