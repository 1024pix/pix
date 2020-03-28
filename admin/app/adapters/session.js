import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = this._super(...arguments);
    if (adapterOptions && adapterOptions.flagResultsAsSentToPrescriber)  {
      delete adapterOptions.flagResultsAsSentToPrescriber;
      return url + '/results-sent-to-prescriber';
    } else if (adapterOptions && adapterOptions.updatePublishedCertifications)  {
      delete adapterOptions.updatePublishedCertifications;
      return url + '/publication';
    } else if (adapterOptions && adapterOptions.userAssignment)  {
      delete adapterOptions.userAssignment;
      return url + '/user-assignment';
    }
    return url;
  },

  updateRecord(store, type, snapshot) {
    if (snapshot.adapterOptions.flagResultsAsSentToPrescriber) {
      return this.ajax(this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot), 'PUT');
    } else if (snapshot.adapterOptions.updatePublishedCertifications) {
      const data =  { data: { attributes: { toPublish: snapshot.adapterOptions.toPublish } } };
      return this.ajax(this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot), 'PATCH', { data });
    } else if (snapshot.adapterOptions.userAssignment) {
      return this.ajax(this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot), 'PATCH');
    }

    return this._super(...arguments);
  }
});
