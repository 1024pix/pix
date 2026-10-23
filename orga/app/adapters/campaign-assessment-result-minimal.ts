import ApplicationAdapter from './application';

export default class CampaignAssessmentResultMinimalAdapter extends ApplicationAdapter {
  urlForQuery(query: Record<string, unknown>, modelName: string): string {
    if (query.campaignId) {
      const { campaignId } = query as { campaignId: string };
      delete query.campaignId;
      return `${this.host}/${this.namespace}/campaigns/${campaignId}/assessment-results`;
    }
    return super.urlForQuery(query, modelName);
  }
}
