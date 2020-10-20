import ApplicationAdapter from './application';

export default class StudentAdapter extends ApplicationAdapter {

  urlForFindAll(modelName, snapshot) {
    const certificationCenterId = snapshot.adapterOptions && snapshot.adapterOptions.certificationCenterId;
    if (certificationCenterId) {
      return `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/students`;
    }
    return super.urlForFindAll(...arguments);
  }
}
