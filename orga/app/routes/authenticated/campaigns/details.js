import Route from '@ember/routing/route';

export default Route.extend({

  navbarItem: 'parameters',

  beforeModel(transition) {
    this.set('navbarItem', transition.targetName.split('.')[3]);
    this._super(...arguments);
  },

  model(params) {
    return this.store.findRecord('campaign', params.campaign_id, { include: 'targetProfile', reload: true })
      .then((campaign) => {
        return { campaign, navbarItem: this.get('navbarItem') };
      });
  },
});
