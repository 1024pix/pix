import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class ResultsRoute extends Route {

  model(params) {
    const campaign = this.modelFor('authenticated.campaigns.details');

    return RSVP.hash({
      campaign,
      campaignParticipation: this.store.findRecord(
        'campaignParticipation',
        params.campaign_participation_id,
        { include: 'user' }
      ),
    });
  }

  renderTemplate() {
    this.render('authenticated.campaigns.details.participants.results', {
      into: 'authenticated.campaigns',
    });
  }

  afterModel(model) {
    model.campaignParticipation.belongsTo('campaignParticipationResult').reload();
  }
}
