import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ProfileAlreadySharedRoute extends Route {
  @service currentUser;

  async model() {
    const user = this.currentUser.user;
    const campaign = this.modelFor('campaigns');
    const sharedProfile = await this.store.queryRecord('sharedProfileForCampaign', { campaignId: campaign.id, userId: user.id });
    return {
      campaign,
      sharedProfile,
      user,
    };
  }
}
