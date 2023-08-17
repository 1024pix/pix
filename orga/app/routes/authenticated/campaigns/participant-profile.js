import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class ProfileRoute extends Route {
  @service router;
  @service store;

  async model(params) {
    try {
      const { campaign_id: campaignId, campaign_participation_id: campaignParticipationId } = params;
      return await RSVP.hash({
        campaign: this.store.findRecord('campaign', campaignId),
        campaignProfile: this.store.queryRecord('campaign-profile', { campaignId, campaignParticipationId }),
        campaignParticipationId,
      });
    } catch (error) {
      this.send('error', error, this.router.replaceWith('not-found', params.campaign_id));
    }
  }
}
