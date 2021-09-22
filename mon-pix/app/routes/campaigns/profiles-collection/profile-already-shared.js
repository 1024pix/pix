import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ProfileAlreadySharedRoute extends Route {
  @service store;
  @service session;
  @service currentUser;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  async model() {
    const user = this.currentUser.user;
    const campaign = this.modelFor('campaigns');
    try {
      const sharedProfile = await this.store.queryRecord('sharedProfileForCampaign', {
        campaignId: campaign.id,
        userId: user.id,
      });
      return {
        campaign,
        sharedProfile,
        user,
      };
    } catch (error) {
      if (error.errors?.[0]?.status === '412') {
        return this.transitionTo('campaigns.start-or-resume', campaign.code);
      } else throw error;
    }
  }
}
