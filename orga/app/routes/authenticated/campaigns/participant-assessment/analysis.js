import Route from '@ember/routing/route';

export default class AnalysisRoute extends Route {
  model() {
    const { campaignAssessmentParticipation } = this.modelFor('authenticated.campaigns.participant-assessment');
    return campaignAssessmentParticipation;
  }

  afterModel(model) {
    return model.belongsTo('campaignAnalysis').reload();
  }
}
