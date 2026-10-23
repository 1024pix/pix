import ApplicationAdapter from './application';

export default class CampaignStatsAdapter extends ApplicationAdapter {
  getParticipationsByStage(campaignId: string) {
    const url = `${this.host}/${this.namespace}/campaigns/${campaignId}/stats/participations-by-stage`;
    return this.ajax(url, 'GET');
  }

  getParticipationsByStatus(campaignId: string) {
    const url = `${this.host}/${this.namespace}/campaigns/${campaignId}/stats/participations-by-status`;
    return this.ajax(url, 'GET');
  }

  getParticipationsByDay(campaignId: string) {
    const url = `${this.host}/${this.namespace}/campaigns/${campaignId}/stats/participations-by-day`;
    return this.ajax(url, 'GET');
  }

  getParticipationsByMasteryRate(campaignId: string) {
    const url = `${this.host}/${this.namespace}/campaigns/${campaignId}/stats/participations-by-mastery-rate`;
    return this.ajax(url, 'GET');
  }

  getBadgeAcquisitions(campaignId: string) {
    const url = `${this.host}/${this.namespace}/campaigns/${campaignId}/stats/badge-acquisitions`;
    return this.ajax(url, 'GET');
  }
}
