import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class ParticipantRoute extends Route {

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
    this.render('authenticated.campaigns.details.participants.participant', {
      into: 'authenticated.campaigns',
    });
  }

}
