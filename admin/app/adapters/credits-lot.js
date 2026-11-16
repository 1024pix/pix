import ApplicationAdapter from './application';

export default class CreditsLotAdapter extends ApplicationAdapter {
  urlForCreateRecord(modelName, { adapterOptions }) {
    const { organizationId } = adapterOptions;
    return `${this.host}/${this.namespace}/organizations/${organizationId}/credits-lots`;
  }
}
