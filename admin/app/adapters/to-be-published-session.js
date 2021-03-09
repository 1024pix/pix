import ApplicationAdapter from './application';

export default class ToBePublishedSessionAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForQuery() {
    return `${this.host}/${this.namespace}/sessions/to-publish`;
  }

  urlForUpdateRecord(id) {
    return `${this.host}/${this.namespace}/sessions/${id}`;
  }

  publishSessionInBatch(sessionIds) {
    const url = `${this.host}/${this.namespace}/sessions/publish-in-batch`;
    const payload = { data: { data: { attributes: { ids: sessionIds } } } };
    return this.ajax(url, 'POST', payload);
  }
}
