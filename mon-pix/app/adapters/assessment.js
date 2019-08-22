import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = this._super(...arguments);

    if (adapterOptions && adapterOptions.improvingAssessment) {
      delete adapterOptions.improvingAssessment;
      return url + '/start-improvment';
    }
    return url;
  },
});
