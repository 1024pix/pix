import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class ParticipantRoute extends Route {

  model(params) {
    return RSVP.hash({
      campaign: this.store.findRecord(
        'campaign',
        params.campaign_id,
      ),
      campaignParticipation: this.store.findRecord(
        'campaignParticipation',
        params.campaign_participation_id,
        { include: 'user' }
      ),
    });
  }
}
