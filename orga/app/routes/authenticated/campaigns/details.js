import Route from '@ember/routing/route';

export default Route.extend({

  navbarItem: '',

  beforeModel(transition) {
    this.set('navbarItem', transition.targetName.split('.')[3]);
    this._super(...arguments);
  },

  model(params) {
    return this.store.findRecord('campaign', params.campaign_id, { include: 'targetProfile' })
      .then((campaign) => {
        return { campaign, navbarItem: this.get('navbarItem') };
      });
  },

  afterModel(model) {
    model.campaign.belongsTo('campaignReport').reload();
  }
});
