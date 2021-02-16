import ApplicationAdapter from './application';

export default class PublishableSessionAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForQuery() {
    return `${this.host}/${this.namespace}/sessions/to-publish`;
  }

  urlForUpdateRecord(id) {
    return `${this.host}/${this.namespace}/sessions/${id}`;
  }
}
