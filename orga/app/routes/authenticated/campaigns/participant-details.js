import Route from '@ember/routing/route';

export default Route.extend({
  campaignId: null,

  model(params) {
    const campaignId =  params.campaign_id;
    return this.store.findRecord('campaignParticipation', params.campaign_participation_id)
      .then((campaignParticipation) => {
        return { campaignParticipation, campaignId }
      });
  },

  afterModel(model) {
    return Promise.all([
      model.campaignParticipation.get('campaignParticipationResult'),
      model.campaignParticipation.get('user'),
    ]);
  }
});
