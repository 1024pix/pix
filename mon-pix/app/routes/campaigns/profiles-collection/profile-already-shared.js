import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ProfileAlreadySharedRoute extends Route {
  @service currentUser;
  @service session;
  @service store;
  @service router;

  beforeModel(transition) {
    const isUserLoaded = !!this.currentUser.user;
    const isAuthenticated = this.session.get('isAuthenticated');
    if (!isAuthenticated || !isUserLoaded) {
      this.session.set('attemptedTransition', transition);
      this.router.transitionTo('login');
    } else if (this.currentUser.user.mustValidateTermsOfService) {
      this.session.set('attemptedTransition', transition);
      this.router.transitionTo('terms-of-service');
    } else {
      return super.beforeModel(...arguments);
    }
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
        return this.router.transitionTo('campaigns.entry-point', campaign.code);
      } else throw error;
    }
  }
}
