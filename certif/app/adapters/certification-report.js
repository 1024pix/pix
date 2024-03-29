import ApplicationAdapter from './application';

export default class CertificationReportAdapter extends ApplicationAdapter {
  urlForCreateRecord(modelName, { adapterOptions }) {
    const url = super.urlForCreateRecord(...arguments);

    if (adapterOptions && adapterOptions.registerToSession) {
      delete adapterOptions.registerToSession;
      const sessionId = adapterOptions.sessionId;
      delete adapterOptions.sessionId;
      return `${this.host}/${this.namespace}/sessions/${sessionId}/certification-reports`;
    }

    return url;
  }

  buildURL(modelName, id, snapshot, requestType, query) {
    if (requestType === 'abort-certification') {
      return `${this.host}/${this.namespace}/certification-reports/${snapshot.record.certificationCourseId}/abort`;
    } else {
      return super.buildURL(modelName, id, snapshot, requestType, query);
    }
  }
}
