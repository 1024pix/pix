import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  urlForCreateRecord(modelName, { adapterOptions }) {
    const url = this._super(...arguments);

    if (adapterOptions && adapterOptions.searchForMatchingStudent) {
      delete adapterOptions.searchForMatchingStudent;
      return url + '/possibilities';
    }

    return url;
  },

  createRecord(store, type, snapshot) {
    if (snapshot.adapterOptions && snapshot.adapterOptions.searchForMatchingStudent) {
      const url = this.buildURL(type.modelName, null, snapshot, 'createRecord');
      const data = this.serialize(snapshot);
      return this.ajax(url, 'PUT', { data });
    }
    return this._super(...arguments);
  },

});

