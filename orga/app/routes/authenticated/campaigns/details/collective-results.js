import Route from '@ember/routing/route';

export default Route.extend({

  async model() {
    const details = await this.modelFor('authenticated.campaigns.details');
    await details.belongsTo('campaignCollectiveResult').reload();

    return details;
  }

});
