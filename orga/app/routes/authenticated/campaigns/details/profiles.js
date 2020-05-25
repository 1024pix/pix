import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class ProfilesRoute extends Route {
  model() {
    const campaign = this.modelFor('authenticated.campaigns.details');
    return RSVP.hash({
      campaign,
      profiles: this.store.query('CampaignProfilesCollectionParticipationSummary', {
        filter: {
          campaignId: campaign.id,
        },
      }),
    });
  }
}

