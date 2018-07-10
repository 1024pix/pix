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
    let data = {};
    let serializer = store.serializerFor(type.modelName);
    if (snapshot.adapterOptions.updateMarks) {
      serializer.serializeIntoHash(data, type, snapshot, { includeId: true});
      data.data.type = 'results';
      data.data.attributes['jury-id'] = null;
      data.data.attributes['emitter'] = 'Jury Pix';
      return this.ajax(this.urlForUpdateMarks(), 'POST', { data: data });
    } else {
      serializer.serializeIntoHash(data, type, snapshot, { includeId: true, onlyInformation:true  });
      return this.ajax(this.buildURL(type.modelName, snapshot.id, snapshot, 'updateRecord'), 'PATCH', { data: data });
    }
  },

  ajaxOptions(url, type) {
    let hash = this._super(...arguments);
    if (type === 'POST') {
      hash.dataType = '*';
    }
    return hash;
  }
});
