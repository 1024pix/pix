import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ProfileRoute extends Route {
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
    await this.currentUser.user.belongsTo('profile').reload();
    return this.currentUser.user;
  }

  @action
  loading() {
    return false;
  }
}
