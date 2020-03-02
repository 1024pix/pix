import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.store.findRecord('campaign', params.campaign_id);
  },

  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set('campaignName', model.name);
  },

  deactivate: function() {
    this.controller.model.rollbackAttributes();
  },
});
