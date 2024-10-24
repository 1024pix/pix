import ApplicationAdapter from './application';

export default class CampaignParticipationSteps extends ApplicationAdapter {
  urlForQueryRecord(query) {
    if (query.campaignCode) {
      const url = `${this.host}/${this.namespace}/campaigns/${query.campaignCode}/presentation-steps`;
      delete query.campaignCode;
      return url;
    }
    return super.urlForQueryRecord(...arguments);
  }
}
