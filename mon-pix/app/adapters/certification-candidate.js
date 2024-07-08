import ApplicationAdapter from './application';

export default class CertificationCandidate extends ApplicationAdapter {
  urlForCreateRecord(modelName, { adapterOptions }) {
    const url = super.urlForCreateRecord(...arguments);

    if (adapterOptions && adapterOptions.joinSession) {
      delete adapterOptions.joinSession;
      const sessionId = adapterOptions.sessionId;
      delete adapterOptions.sessionId;
      return `${this.host}/${this.namespace}/sessions/${sessionId}/candidate-participation`;
    }

    return url;
  }

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = super.urlForUpdateRecord(...arguments);

    if (adapterOptions && adapterOptions.hasSeenCertificationInstructions) {
      delete adapterOptions.hasSeenCertificationInstructions;
      return `${url}/validate-certification-instructions`;
    }

    return url;
  }
}
