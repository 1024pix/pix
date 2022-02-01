import ApplicationAdapter from './application';

export default class SessionForSupervisingAdapter extends ApplicationAdapter {
  urlForQueryRecord(query) {
    const sessionId = query.sessionId;
    if (sessionId) {
      delete query.sessionId;
      return `${this.host}/${this.namespace}/sessions/${sessionId}/supervising`;
    }
    return super.urlForQuery(...arguments);
  }
}
