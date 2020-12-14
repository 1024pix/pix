import ApplicationAdapter from './application';

export default class SessionAdapter extends ApplicationAdapter {

  urlForQuery() {
    return `${this.host}/${this.namespace}/admin/sessions`;
  }

  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/admin/sessions/${id}`;
  }

  urlForUpdateRecord(id) {
    return `${this.host}/${this.namespace}/admin/sessions/${id}`;
  }

  updateRecord(store, type, snapshot) {
    if (snapshot.adapterOptions.flagResultsAsSentToPrescriber) {
      const url = this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot) + '/results-sent-to-prescriber';
      return this.ajax(url, 'PUT');
    }
    if (snapshot.adapterOptions.updatePublishedCertifications) {
      const data = { data: { attributes: { toPublish: snapshot.adapterOptions.toPublish } } };
      const url = this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot) + '/publication';
      return this.ajax(url, 'PATCH', { data });
    }
    if (snapshot.adapterOptions.certificationOfficerAssignment) {
      const url = this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot) + '/certification-officer-assignment';
      return this.ajax(url, 'PATCH');
    }

    return super.updateRecord(...arguments);
  }
}
