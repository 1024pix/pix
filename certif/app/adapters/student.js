import ApplicationAdapter from './application';

export default class StudentAdapter extends ApplicationAdapter {

  urlForFindAll(modelName, snapshot) {
    const certificationCenterId = snapshot.adapterOptions && snapshot.adapterOptions.certificationCenterId;
    const sessionId = snapshot.adapterOptions && snapshot.adapterOptions.sessionId;

    if (certificationCenterId && sessionId) {
      return `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/sessions/${sessionId}/students`;
    }
    return super.urlForFindAll(...arguments);
  }
}
