import ApplicationAdapter from './application';

export default class MembershipAdapter extends ApplicationAdapter {

  updateRecord(store, type, snapshot) {
    if (snapshot.adapterOptions && snapshot.adapterOptions.disable) {
      const url = this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot) + '/disable';
      return this.ajax(url, 'POST');
    }
    return super.updateRecord(...arguments);
  }
}
