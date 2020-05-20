import ApplicationAdapter from './application';

export default class CampaignAssessmentParticipationSummary extends ApplicationAdapter {

  urlForQuery(query) {
    const { campaignId } = query;
    return `${this.host}/${this.namespace}/campaigns/${campaignId}/assessment-participations`;
  }

}
