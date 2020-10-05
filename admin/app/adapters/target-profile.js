import ApplicationAdapter from './application';

export default class TargetProfileAdapter extends ApplicationAdapter {

  urlForQuery() {
    return `${this.host}/${this.namespace}/admin/target-profiles`;
  }

  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/admin/target-profiles/${id}`;
  }
}
