import ApplicationAdapter from './application';

export default class UserOrgaSetting extends ApplicationAdapter {
  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const { userId } = adapterOptions;
    return `${this.host}/${this.namespace}/user-orga-settings/${userId}`;
  }

  updateRecord(store, type, snapshot) {
    const data = this.serialize(snapshot);
    const url = this.buildURL(type.modelName, snapshot.adapterOptions.userId, snapshot, 'updateRecord');
    return this.ajax(url, 'PUT', { data });
  }
}
