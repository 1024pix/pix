import ApplicationAdapter from './application';

export default class CampaignAssessmentResultMinimalAdapter extends ApplicationAdapter {
  urlForQuery(query) {
    if (query.campaignId) {
      const { campaignId } = query;
      delete query.campaignId;
      return `${this.host}/${this.namespace}/campaigns/${campaignId}/assessment-results`;
    }
  }
}
