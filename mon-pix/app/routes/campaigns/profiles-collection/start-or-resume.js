import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ProfilesCollectionCampaignsStartOrResumeRoute extends Route {
  @service session;
  @service router;
  @service currentUser;

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
    return this.modelFor('campaigns.profiles-collection');
  }

  redirect({ campaign, campaignParticipation }) {
    if (campaignParticipation.isShared) {
      return this.router.replaceWith('campaigns.profiles-collection.profile-already-shared', campaign.code);
    }
    return this.router.replaceWith('campaigns.profiles-collection.send-profile', campaign.code);
  }
}
