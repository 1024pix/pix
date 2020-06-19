import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ProfilesCollectionRoute extends Route {
  @service currentUser;

  async model() {
    const campaign = this.modelFor('campaigns');
    const campaignParticipation = await this.store.queryRecord('campaignParticipation', { campaignId: campaign.id, userId: this.currentUser.user.id });
    return {
      campaign,
      campaignParticipation,
    };
  }
}
