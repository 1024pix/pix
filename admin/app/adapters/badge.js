import ApplicationAdapter from './application';

export default class BadgeAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForCreateRecord(modelName, { adapterOptions: { targetProfileId } }) {
    return `${this.host}/${this.namespace}/target-profiles/${targetProfileId}/badges`;
  }

  updateRecord(store, type, snapshot) {
    const payload = this.serialize(snapshot);

    delete payload.data.attributes['campaign-threshold'];
    delete payload.data.attributes['capped-tubes-criteria'];

    const url = this.buildURL(type.modelName, snapshot.id, snapshot, 'updateRecord');
    return this.ajax(url, 'PATCH', { data: payload });
  }
}
