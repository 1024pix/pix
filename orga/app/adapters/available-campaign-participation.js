import ApplicationAdapter from './application';

export default class availableCampaignParticipationAdapter extends ApplicationAdapter {
  urlForQuery(query) {
    const { campaignId, organizationLearnerId } = query;
    delete query.campaignId;
    delete query.organizationLearnerId;

    return `${this.host}/${this.namespace}/campaigns/${campaignId}/organization-learners/${organizationLearnerId}/participations`;
  }
}
