import ApplicationAdapter from './application';

export default class MemberAdapter extends ApplicationAdapter {

  urlForFindAll(modelName, { adapterOptions }) {
    const { certificationCenterId } = adapterOptions;
    return `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/members`;
  }

}
