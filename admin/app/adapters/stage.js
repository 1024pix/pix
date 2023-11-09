import ApplicationAdapter from './application';

export default class StageAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  deleteRecord(store, type, snapshot) {
    const data = {};
    const serializer = store.serializerFor(type.modelName);
    serializer.serializeIntoHash(data, type, snapshot, { includeId: true, onlyInformation: true });
    return this.ajax(this.buildURL(type.modelName, snapshot.id, snapshot, 'deleteRecord'), 'DELETE', { data: data });
  }

  updateRecord(store, type, snapshot) {
    const { adapterOptions } = snapshot;

    const payload = this.serialize(snapshot);
    payload.data.attributes = {
      message: adapterOptions.stage.message,
      prescriberDescription: adapterOptions.stage.prescriberDescription,
      prescriberTitle: adapterOptions.stage.prescriberTitle,
      title: adapterOptions.stage.title,
      level: adapterOptions.stage.level,
      threshold: adapterOptions.stage.threshold,
      targetProfileId: adapterOptions.targetProfileId,
    };

    const url = this.buildURL(type.modelName, snapshot.id, snapshot, 'updateRecord');

    return this.ajax(url, 'PATCH', { data: payload });
  }
}
