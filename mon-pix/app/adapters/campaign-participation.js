import classic from 'ember-classic-decorator';
import ApplicationAdapter from './application';

@classic
export default class CampaignParticipation extends ApplicationAdapter {
  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = super.urlForUpdateRecord(...arguments);

    if (adapterOptions && adapterOptions.beginImprovement) {
      delete adapterOptions.beginImprovement;
      return url + '/begin-improvement';
    }
    return url;
  }

  urlForQueryRecord(query) {
    if (query.userId && query.campaignId) {
      const url = `${this.host}/${this.namespace}/users/${query.userId}/campaigns/${query.campaignId}/campaign-participations`;
      delete query.userId;
      delete query.campaignId;
      return url;
    }

    return super.urlForQueryRecord(...arguments);
  }
}

