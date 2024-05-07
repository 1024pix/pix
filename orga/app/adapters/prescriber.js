import ApplicationAdapter from './application';

export default class PrescriberAdapter extends ApplicationAdapter {
  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/prescription/prescribers/${id}`;
  }

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    if (adapterOptions && adapterOptions.acceptPixOrgaTermsOfService) {
      return `${this.host}/${this.namespace}/users/${id}/pix-orga-terms-of-service-acceptance`;
    }

    if (adapterOptions && adapterOptions.lang) {
      return `${this.host}/${this.namespace}/users/${id}/lang/${adapterOptions.lang}`;
    }
  }

  async updateRecord(store, type, snapshot) {
    const url = this.buildURL(type.modelName, snapshot.id, snapshot, 'updateRecord');
    await this.ajax(url, 'PATCH');
    return null;
  }

  // @see https://discuss.emberjs.com/t/how-to-save-a-model-and-ignore-its-return-payload/15730
  // @see https://emberigniter.com/retrieve-ember-data-models-non-rest-api/
}
