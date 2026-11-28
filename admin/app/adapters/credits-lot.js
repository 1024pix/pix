import ApplicationAdapter from './application';

export default class CreditsLotAdapter extends ApplicationAdapter {
  urlForQuery(query) {
    const baseUrl = this.buildURL();
    const { organizationId } = query;
    const url = `${baseUrl}/organizations/${organizationId}/credits-lots`;
    delete query.organizationId;

    return url;
  }

  urlForCreateRecord(modelName, { adapterOptions }) {
    const { organizationId } = adapterOptions;
    return `${this.host}/${this.namespace}/organizations/${organizationId}/credits-lots`;
  }
}
