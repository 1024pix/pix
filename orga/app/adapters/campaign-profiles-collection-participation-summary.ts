import ApplicationAdapter from './application';

export default class CampaignProfilesCollectionParticipationSummaryAdapter extends ApplicationAdapter {
  urlForQuery(query: Record<string, unknown>, modelName: string): string {
    const filter = query.filter as { campaignId?: string };
    if (filter.campaignId) {
      const { campaignId } = filter;
      delete filter.campaignId;

      return `${this.host}/${this.namespace}/campaigns/${campaignId}/profiles-collection-participations`;
    }
    return super.urlForQuery(query, modelName);
  }
}
