import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = this._super(...arguments);

    if (adapterOptions && adapterOptions.beginImprovement) {
      delete adapterOptions.beginImprovement;
      return url + '/begin-improvement';
    }
    return url;
  },

});

