import ApplicationAdapter from './application';

export default class ToBePublishedSessionAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForQuery() {
    return `${this.host}/${this.namespace}/sessions/to-publish`;
  }

  publishSession(id) {
    const url = `${this.host}/${this.namespace}/sessions/${id}/publish`;
    return this.ajax(url, 'PATCH');
  }

  publishSessionInBatch(sessionIds) {
    const url = `${this.host}/${this.namespace}/sessions/publish-in-batch`;
    const payload = { data: { data: { attributes: { ids: sessionIds } } } };
    return this.ajax(url, 'POST', payload);
  }
}
