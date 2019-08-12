import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = this._super(...arguments);

    if (adapterOptions && adapterOptions.improvmentCampaignParticipationResult) {
      delete adapterOptions.improvmentCampaignParticipationResult;
      return url + '/start-improvment';
    }
    return url;
  },
});
