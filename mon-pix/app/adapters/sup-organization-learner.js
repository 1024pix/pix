import ApplicationAdapter from './application';

export default class SupOrganizationLearner extends ApplicationAdapter {
  urlForCreateRecord() {
    const url = super.urlForCreateRecord(...arguments);
    return url + '/association';
  }

  createRecord(store, type, snapshot) {
    const url = this.buildURL(type.modelName, null, snapshot, 'createRecord');
    const data = this.serialize(snapshot);
    return this.ajax(url, 'POST', { data });
  }
}
