import ApplicationAdapter from './application';

export default class SessionAdapter extends ApplicationAdapter {

  urlForCreateRecord(modelName, { adapterOptions }) {
    const url = super.urlForCreateRecord(...arguments);

    if (adapterOptions && adapterOptions.registerToSession) {
      delete adapterOptions.registerToSession;
      const sessionId = adapterOptions.sessionId;
      delete adapterOptions.sessionId;
      return `${this.host}/${this.namespace}/sessions/${sessionId}/certification-candidates`;
    }

    return url;
  }

  urlForDeleteRecord(id, modelName, { adapterOptions }) {
    const url = super.urlForDeleteRecord(...arguments);

    if (adapterOptions && adapterOptions.sessionId) {
      const sessionId = adapterOptions.sessionId;
      delete adapterOptions.sessionId;
      return `${this.host}/${this.namespace}/sessions/${sessionId}/certification-candidates/${id}`;
    }

    return url;
  }
}
