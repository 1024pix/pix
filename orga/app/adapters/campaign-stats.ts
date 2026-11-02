import ApplicationAdapter from './application';

export default class CampaignStatsAdapter extends ApplicationAdapter {
  getParticipationsByStage(campaignId: string) {
    return this.getStats(campaignId, 'participations-by-stage');
  }

  getParticipationsByStatus(campaignId: string) {
    return this.getStats(campaignId, 'participations-by-status');
  }

  getParticipationsByDay(campaignId: string) {
    return this.getStats(campaignId, 'participations-by-day');
  }

  getParticipationsByMasteryRate(campaignId: string) {
    return this.getStats(campaignId, 'participations-by-mastery-rate');
  }

  getBadgeAcquisitions(campaignId: string) {
    return this.getStats(campaignId, 'badge-acquisitions');
  }

  private getStats(campaignId: string, stat: string) {
    return this.ajax(this.apiUrl(`campaigns/${campaignId}/stats/${stat}`), 'GET');
  }
}
