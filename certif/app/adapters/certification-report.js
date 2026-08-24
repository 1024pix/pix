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

  abort({ certificationCourseId, reason }) {
    const payload = { data: { reason } };
    const url = `${this.host}/${this.namespace}/certification-reports/${certificationCourseId}/abort`;

    return this.ajax(url, 'POST', { data: payload });
  }
}
