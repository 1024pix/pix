import ApplicationAdapter from './application';

export default class CampaignAssessmentParticipationAdapter extends ApplicationAdapter {
  urlForQueryRecord(query: Record<string, unknown>): string {
    const { campaignId, campaignParticipationId } = query as { campaignId: string; campaignParticipationId: string };
    delete query.campaignId;
    delete query.campaignParticipationId;
    return `${this.host}/${this.namespace}/campaigns/${campaignId}/assessment-participations/${campaignParticipationId}`;
  }
}
