import ApplicationAdapter from './application';

export default class CampaignProfile extends ApplicationAdapter {
  urlForQueryRecord(query) {
    const { campaignId, campaignParticipationId } = query;
    delete query.campaignId;
    delete query.campaignParticipationId;
    return `${this.host}/${this.namespace}/campaigns/${campaignId}/profiles-collection-participations/${campaignParticipationId}`;
  }
}
