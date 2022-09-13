import ApplicationAdapter from './application';

export default class StageAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  createRecord(store, type, snapshot) {
    const { adapterOptions } = snapshot;
    const payload = this.serialize(snapshot);
    payload.data.attributes['target-profile-id'] = adapterOptions.targetProfileId;
    const url = this.buildURL(type.modelName, null, snapshot, 'createRecord');

    return this.ajax(url, 'POST', { data: payload });
  }
}
