import ApplicationAdapter from './application';

export default class CertificationCandidateAdapter extends ApplicationAdapter {
  urlForQuery(query) {
    const sessionId = query.sessionId;
    if (sessionId) {
      delete query.sessionId;
      return `${this.host}/${this.namespace}/sessions/${sessionId}/certification-candidates`;
    }
    return super.urlForQuery(...arguments);
  }
}
