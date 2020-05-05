import Route from '@ember/routing/route';

export default class AnalysisRoute extends Route {

  model() {
    const { campaignParticipation } = this.modelFor('authenticated.campaigns.participant');
    return campaignParticipation;
  }

  afterModel(model) {
    return model.belongsTo('campaignAnalysis').reload();
  }
}
