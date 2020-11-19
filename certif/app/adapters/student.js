import ApplicationAdapter from './application';

export default class StudentAdapter extends ApplicationAdapter {

  urlForQuery(query) {
    const { sessionId, certificationCenterId } = query.filter;
    if (sessionId && certificationCenterId) {
      delete query.filter.sessionId;
      delete query.filter.certificationCenterId;
      return `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/sessions/${sessionId}/students`;
    }
    return super.urlForQuery(...arguments);
  } 
}
