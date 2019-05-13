import Route from '@ember/routing/route';

export default Route.extend({

  model() {
    const campaign = this.modelFor('authenticated.campaigns.details');
    return campaign.campaignCollectiveResult;
  },

});
