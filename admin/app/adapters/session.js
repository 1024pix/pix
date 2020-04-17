import ApplicationAdapter from './application';

export default class SessionAdapter extends ApplicationAdapter {

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = super.urlForUpdateRecord(...arguments);
    if (adapterOptions && adapterOptions.flagResultsAsSentToPrescriber)  {
      delete adapterOptions.flagResultsAsSentToPrescriber;
      return url + '/results-sent-to-prescriber';
    }
    if (adapterOptions && adapterOptions.updatePublishedCertifications)  {
      delete adapterOptions.updatePublishedCertifications;
      return url + '/publication';
    }
    if (adapterOptions && adapterOptions.certificationOfficerAssignment)  {
      delete adapterOptions.certificationOfficerAssignment;
      return url + '/certification-officer-assignment';
    }
    return url;
  }

  updateRecord(store, type, snapshot) {
    if (snapshot.adapterOptions.flagResultsAsSentToPrescriber) {
      return this.ajax(this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot), 'PUT');
    }
    if (snapshot.adapterOptions.updatePublishedCertifications) {
      const data =  { data: { attributes: { toPublish: snapshot.adapterOptions.toPublish } } };
      return this.ajax(this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot), 'PATCH', { data });
    }
    if (snapshot.adapterOptions.certificationOfficerAssignment) {
      return this.ajax(this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot), 'PATCH');
    }

    return super.updateRecord(...arguments);
  }
}
