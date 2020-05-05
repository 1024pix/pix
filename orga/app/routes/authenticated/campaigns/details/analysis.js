import Route from '@ember/routing/route';

export default class CampaignAnalysisRoute extends Route {

  model() {
    return this.modelFor('authenticated.campaigns.details');
  }

  afterModel(model) {
    return model.belongsTo('campaignAnalysis').reload();
  }
}
