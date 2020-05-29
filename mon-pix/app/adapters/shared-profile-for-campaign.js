import ApplicationAdapter from './application';

export default class SharedProfileForCampaign extends ApplicationAdapter {

  urlForQueryRecord(query) {
    if (query.userId && query.campaignId) {
      const url = `${this.host}/${this.namespace}/users/${query.userId}/campaigns/${query.campaignId}/profile`;
      delete query.userId;
      delete query.campaignId;
      return url;
    }
    return super.urlForQueryRecord(...arguments);
  }

}
