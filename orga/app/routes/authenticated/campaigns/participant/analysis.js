import Route from '@ember/routing/route';

export default class AnalysisRoute extends Route {

  model() {
    const { campaignAssessmentParticipation } = this.modelFor('authenticated.campaigns.participant');
    return campaignAssessmentParticipation.campaignAnalysis;
  }
}
