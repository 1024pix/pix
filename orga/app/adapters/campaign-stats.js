import ApplicationAdapter from './application';

export default class CampaignStatsAdapter extends ApplicationAdapter {
  getParticipationsByStage(campaignId) {
    const url = `${this.host}/${this.namespace}/campaigns/${campaignId}/stats/participations-by-stage`;
    return this.ajax(url, 'GET');
  }
}
