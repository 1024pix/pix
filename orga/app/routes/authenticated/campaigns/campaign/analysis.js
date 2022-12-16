import Route from '@ember/routing/route';

export default class AnalysisRoute extends Route {
  async model() {
    const campaign = this.modelFor('authenticated.campaigns.campaign');
    await campaign.belongsTo('campaignAnalysis').reload();
    await campaign.belongsTo('campaignCollectiveResult').reload();
    return campaign;
  }
}
