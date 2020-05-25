import ApplicationAdapter from './application';

export default class CampaignProfilesCollectionParticipationSummary extends ApplicationAdapter {

  urlForQuery(query) {
    if (query.filter.campaignId) {
      const { campaignId } = query.filter;
      delete query.filter.campaignId;

      return `${this.host}/${this.namespace}/campaigns/${campaignId}/profiles-collection/participations`;
    }
    return super.urlForQuery(...arguments);
  }

}
