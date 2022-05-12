import ApplicationAdapter from './application';

export default class CampaignParticipantActivity extends ApplicationAdapter {
  urlForQuery(query) {
    if (query.campaignId) {
      const { campaignId } = query;
      delete query.campaignId;
      return `${this.host}/${this.namespace}/campaigns/${campaignId}/participants-activity`;
    }
  }

  urlForDeleteRecord(id, modelName, { adapterOptions }) {
    return `${this.host}/${this.namespace}/campaigns/${adapterOptions.campaignId}/campaign-participations/${adapterOptions.campaignParticipationId}`;
  }
}
