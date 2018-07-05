import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  urlForFindRecord (id) {
    return this.host + '/admin/certifications/'+id;
  },

  urlForUpdateMarks() {
    return this.host + '/admin/assessment-results/';
  },

  urlForUpdateRecord(id) {
    return this.host + '/certification-courses/'+id;
  },

  updateRecord(store, type, snapshot) {
    let data = {}, marksData = {};
    let requests = [];
    let serializer = store.serializerFor(type.modelName);
    serializer.serializeIntoHash(data, type, snapshot, { includeId: true, onlyInformation:true });
    requests.push(this.ajax(this.buildURL(type.modelName, snapshot.id, snapshot, 'updateRecord'), 'PATCH', { data: data }));
    serializer.serializeIntoHash(marksData, type, snapshot, { includeId: true });
    marksData.data.type = 'results';
    marksData.data.attributes['jury-id'] = null;
    marksData.data.attributes['emitter'] = 'Jury Pix';
    requests.push(this.ajax(this.urlForUpdateMarks(), 'POST', { data: marksData }));
    return Promise.all(requests);
  }

});
