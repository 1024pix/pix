import Route from '@ember/routing/route';

export default class AnalysisRoute extends Route {

  model() {
    return this.modelFor('authenticated.campaigns.campaign');
  }

  afterModel(model) {
    return model.belongsTo('campaignAnalysis').reload();
  }
}
