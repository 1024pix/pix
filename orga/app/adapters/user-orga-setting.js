import ApplicationAdapter from './application';

export default class UserOrgaSetting extends ApplicationAdapter {
  urlForCreateRecord(modelName, { adapterOptions }) {
    const { userId } = adapterOptions;
    return `${this.host}/${this.namespace}/user-orga-settings/${userId}`;
  }

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const { userId } = adapterOptions;
    return `${this.host}/${this.namespace}/user-orga-settings/${userId}`;
  }

  createRecord(store, type, snapshot) {
    const data = this.serialize(snapshot);
    const url = this.buildURL(type.modelName, snapshot.adapterOptions.userId, snapshot, 'createRecord');
    return this.ajax(url, 'PUT', { data });
  }

  updateRecord(store, type, snapshot) {
    const data = this.serialize(snapshot);
    const url = this.buildURL(type.modelName, snapshot.adapterOptions.userId, snapshot, 'updateRecord');
    return this.ajax(url, 'PUT', { data });
  }
}
