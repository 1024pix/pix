import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SendProfileRoute extends Route {
  @service currentUser;
  @service session;
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
    const { campaign, campaignParticipation } = this.modelFor('campaigns.profiles-collection');
    return {
      campaign,
      campaignParticipation,
      user,
    };
  }

  async afterModel({ user }) {
    await user.belongsTo('profile').reload();
  }
}
