import ApplicationAdapter from './application';

export default class MissionAdapter extends ApplicationAdapter {
  urlForFindAll(modelName, { adapterOptions }) {
    const { organizationId } = adapterOptions;
    return `${this.host}/${this.namespace}/organizations/${organizationId}/missions`;
  }
}
