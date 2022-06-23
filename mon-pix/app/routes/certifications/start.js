import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class StartRoute extends Route {
  @service session;
  @service store;
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

  model(params) {
    return this.store.findRecord('certification-candidate-subscription', params.certification_candidate_id);
  }
}
