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

  share(id) {
    const url = `${this.host}/${this.namespace}/campaign-participations/${id}`;
    return this.ajax(url, 'PATCH');
  }

  beginImprovement(id) {
    const url = `${this.host}/${this.namespace}/campaign-participations/${id}/begin-improvement`;
    return this.ajax(url, 'PATCH');
  }
}
