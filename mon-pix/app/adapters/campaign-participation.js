import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = this._super(...arguments);

    if (adapterOptions && adapterOptions.startImprovement) {
      delete adapterOptions.startImprovement;
      return url + '/start-improvement';
    }
    return url;
  },

});

