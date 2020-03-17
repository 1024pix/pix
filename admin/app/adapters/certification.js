import ApplicationAdapter from './application';

export default class Certification extends ApplicationAdapter {

  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/admin/certifications/${id}`;
  }

  urlForUpdateMarks() {
    return `${this.host}/${this.namespace}/admin/assessment-results/`;
  }

  urlForUpdateRecord(id) {
    return `${this.host}/${this.namespace}/certification-courses/${id}`;
  }

  updateRecord(store, type, snapshot) {
    const data = {};
    const serializer = store.serializerFor(type.modelName);
    if (snapshot.adapterOptions.updateMarks) {
      serializer.serializeIntoHash(data, type, snapshot, { includeId: true });
      data.data.type = 'results';
      data.data.attributes['jury-id'] = null;
      data.data.attributes['emitter'] = 'Jury Pix';
      return this.ajax(this.urlForUpdateMarks(), 'POST', { data: data });
    } else {
      serializer.serializeIntoHash(data, type, snapshot, { includeId: true, onlyInformation: true });
      return this.ajax(this.buildURL(type.modelName, snapshot.id, snapshot, 'updateRecord'), 'PATCH', { data: data });
    }
  }

  ajaxOptions(url, type) {
    const hash = super.ajaxOptions(...arguments);
    if (type === 'POST') {
      hash.dataType = '*';
    }
    return hash;
  }
}
