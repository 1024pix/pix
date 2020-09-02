import Route from '@ember/routing/route';

export default class CollectiveResultsRoute extends Route {

  model() {
    const details = this.modelFor('authenticated.campaigns.campaign');
    return details.belongsTo('campaignCollectiveResult').reload()
      .then(() => details);
  }
}
