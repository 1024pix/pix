import ApplicationAdapter from './application';

export default class CertificationCenterAdapter extends ApplicationAdapter {
  updateRecord(store, type, snapshot) {
    const model = snapshot.record;
    const serializer = store.serializerFor(type.modelName);
    const data = {};
    serializer.serializeIntoHash(data, type, snapshot, { includeId: true });
    data.data.included = model.accreditations.map((accreditation) => {
      return {
        type: 'accreditations',
        id: accreditation.get('id'),
        attributes: { ...accreditation.toJSON() },
      };
    });
    return this.ajax(this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot), 'PATCH', { data });
  }
}
