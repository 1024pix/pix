import Route from '@ember/routing/route';

export default class ResultsRoute extends Route {

  model() {
    const { campaignParticipation } = this.modelFor('authenticated.campaigns.details.participants.participant');
    return campaignParticipation;
  }

  afterModel(model) {
    model.belongsTo('campaignParticipationResult').reload();
  }
}
