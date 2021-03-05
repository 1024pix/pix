import ApplicationAdapter from './application';

export default class ToBePublishedSessionAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForQuery() {
    return `${this.host}/${this.namespace}/sessions/to-publish`;
  }

  urlForUpdateRecord(id) {
    return `${this.host}/${this.namespace}/sessions/${id}`;
  }
}
