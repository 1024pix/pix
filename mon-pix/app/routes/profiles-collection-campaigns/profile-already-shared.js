import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ProfileAlreadySharedRoute extends Route {
  @service currentUser;
  @service store;

  async model() {
    const user = this.currentUser.user;
    const campaignCode = this.paramsFor('profiles-collection-campaigns').campaign_code;
    const campaigns = await this.store.query('campaign', { filter: { code: campaignCode } });
    const campaign = campaigns.get('firstObject');
    return RSVP.hash({
      campaign,
      campaignParticipation: this.store.queryRecord('campaignParticipation', { campaignId: campaign.id, userId: user.id }),
      user
    });
  }
}
