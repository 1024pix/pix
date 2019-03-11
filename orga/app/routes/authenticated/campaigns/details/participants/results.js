import Route from '@ember/routing/route';

export default Route.extend({

  model(params) {
    return this.store.findRecord('campaignParticipation', params.campaign_participation_id, { include: 'user' });
  },

  renderTemplate() {
    this.render('authenticated.campaigns.details.participants.results', {
      into: 'authenticated.campaigns',
    });
  },

  afterModel(model) {
    model.belongsTo('campaignParticipationResult').reload();
  }
});
