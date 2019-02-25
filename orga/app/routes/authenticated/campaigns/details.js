
import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.store.findRecord('campaign', params.campaign_id, { include: 'targetProfile' });
  },

  afterModel(model) {
    model.belongsTo('campaignReport').reload();
  }
});
