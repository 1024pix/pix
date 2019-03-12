import Route from '@ember/routing/route';

export default Route.extend({


  model(params, transition) {
    const campaignId = transition.params['authenticated.campaigns.details'].campaign_id;
    return this.store.findRecord('campaignParticipation', params.campaign_participation_id, { include: 'user' })
      .then((campaignParticipation) => {
        return {
          campaignParticipation,
          campaignId
        }
      });
  },

  renderTemplate() {
    this.render('authenticated.campaigns.details.participants.results', {
      into: 'authenticated.campaigns',
    });
  },

  afterModel(model) {
    model.campaignParticipation.belongsTo('campaignParticipationResult').reload();
  }
});
