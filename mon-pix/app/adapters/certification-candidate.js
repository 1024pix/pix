import classic from 'ember-classic-decorator';
import ApplicationAdapter from './application';

@classic
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
}
