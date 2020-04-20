import Route from '@ember/routing/route';

export default class ResultsRoute extends Route {

  model() {
    return this.modelFor('authenticated.campaigns.details.participants.participant');
  }

  afterModel(model) {
    model.campaignParticipation.belongsTo('campaignParticipationResult').reload();
  }
}
