import ApplicationAdapter from './application';

export default class CampaignParticipationResult extends ApplicationAdapter {

  urlForQueryRecord(query) {
    if (query.userId && query.campaignId) {
      const url = `${this.host}/${this.namespace}/users/${query.userId}/campaigns/${query.campaignId}/assessment-result`;
      delete query.userId;
      delete query.campaignId;
      return url;
    }
    return super.urlForQueryRecord(...arguments);
  }
}
