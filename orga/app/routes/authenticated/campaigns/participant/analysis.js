import Route from '@ember/routing/route';

export default class AnalysisRoute extends Route {

  model() {
    const { campaignParticipation } = this.modelFor('authenticated.campaigns.participant');
    return campaignParticipation;
  }

  async afterModel(model) {
    if (model.campaignAnalysis.isFulfilled) {
      await model.belongsTo('campaignAnalysis').reload();
    }
    return model;
  }
}
