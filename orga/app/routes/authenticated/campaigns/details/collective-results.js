import Route from '@ember/routing/route';

export default Route.extend({

  model() {
    return this.modelFor('authenticated.campaigns.details');
  },

  afterModel(model) {
    model.belongsTo('campaignCollectiveResult').reload();
  }

});
