import ApplicationAdapter from './application';

export default class AvailableCampaignParticipationAdapter extends ApplicationAdapter {
  urlForQuery(query: Record<string, unknown>): string {
    const { campaignId, organizationLearnerId } = query as { campaignId: string; organizationLearnerId: string };
    delete query.campaignId;
    delete query.organizationLearnerId;

    return `${this.host}/${this.namespace}/campaigns/${campaignId}/organization-learners/${organizationLearnerId}/participations`;
  }
}
