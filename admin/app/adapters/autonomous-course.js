import ApplicationAdapter from './application';

export default class AutonomousCourseAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  updateRecord(store, type, snapshot) {
    const data = {};
    const serializer = store.serializerFor(type.modelName);
    serializer.serializeIntoHash(data, type, snapshot, { includeId: false, onlyInformation: true });
    delete data.data.attributes['target-profile-id'];
    delete data.data.attributes['code'];
    delete data.data.attributes['created-at'];
    return this.ajax(this.buildURL(type.modelName, snapshot.id, snapshot, 'updateRecord'), 'PATCH', { data: data });
  }
}
