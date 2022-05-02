import ApplicationAdapter from './application';

export default class UserSetting extends ApplicationAdapter {
  createRecord(store, type, snapshot) {
    const url = this.buildURL(type.modelName, null, snapshot, 'createRecord');
    return this.ajax(url, 'PUT', { data: snapshot.serialize() });
  }

  updateRecord(store, type, snapshot) {
    const url = this.buildURL(type.modelName, null, snapshot, 'createRecord');
    return this.ajax(url, 'PUT', { data: snapshot.serialize() });
  }
}
