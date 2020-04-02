import Route from '@ember/routing/route';

export default class CampaignAnalysisRoute extends Route {

  model() {
    const campaign = this.modelFor('authenticated.campaigns.details');
    return campaign.belongsTo('campaignAnalysis').reload()
      .then(() => campaign);
  }
}
