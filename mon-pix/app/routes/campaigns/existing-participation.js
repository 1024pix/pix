import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ExistingParticipation extends Route {
  @service store;
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

  model() {
    const { code } = this.paramsFor('campaigns');
    return this.store.queryRecord('organization-learner-identity', {
      userId: this.currentUser.user.id,
      campaignCode: code,
    });
  }
}
