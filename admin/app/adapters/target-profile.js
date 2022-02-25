import ApplicationAdapter from './application';

export default class TargetProfileAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  updateRecord(store, type, snapshot) {
    if (snapshot?.adapterOptions?.markTargetProfileAsSimplifiedAccess) {
      const url = `${this.host}/${this.namespace}/target-profiles/${snapshot.id}/simplified-access`;
      return this.ajax(url, 'PUT');
    }

    return super.updateRecord(...arguments);
  }
}
