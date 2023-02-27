import ApplicationAdapter from './application';

export default class StageAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  deleteRecord(store, type, snapshot) {
    const data = {};
    const serializer = store.serializerFor(type.modelName);
    serializer.serializeIntoHash(data, type, snapshot, { includeId: true, onlyInformation: true });
    return this.ajax(this.buildURL(type.modelName, snapshot.id, snapshot, 'deleteRecord'), 'DELETE', { data: data });
  }
}
