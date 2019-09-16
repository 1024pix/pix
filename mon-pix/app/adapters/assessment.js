import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = this._super(...arguments);

    if (adapterOptions && adapterOptions.completeAssessment) {
      delete adapterOptions.completeAssessment;
      return url + '/complete-assessment';
    }

    return url;
  },
});
