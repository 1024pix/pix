import Route from '@ember/routing/route';

export default Route.extend({


  model(params, transition) {
    const campaignId = transition.params['authenticated.campaigns.details'].campaign_id;
    return Promise.all([
      this.store.findRecord('campaignParticipation', params.campaign_participation_id, { include: 'user' }),
      this.store.findRecord('campaign', campaignId)
    ])
      .then(([campaignParticipation, campaign]) => {
        return {
          campaignParticipation,
          campaign
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
