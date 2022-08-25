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

  createRecord(store, type, snapshot) {
    const { adapterOptions } = snapshot;

    if (adapterOptions && adapterOptions.tubes) {
      const { tubes } = adapterOptions;
      const payload = this.serialize(snapshot);
      payload.data.attributes.tubes = tubes;

      const url = `${this.host}/${this.namespace}/target-profiles`;

      return this.ajax(url, 'POST', { data: payload });
    }

    return super.createRecord(...arguments);
  }
}
