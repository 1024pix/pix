import Route from '@ember/routing/route';

export default class ResultsRoute extends Route {

  model() {
    const { campaignParticipation } = this.modelFor('authenticated.campaigns.participant');
    return campaignParticipation;
  }

  async afterModel(model) {
    if (model.campaignParticipationResult.isFulfilled) {
      await model.belongsTo('campaignParticipationResult').reload();
    }
    return model;
  }
}
