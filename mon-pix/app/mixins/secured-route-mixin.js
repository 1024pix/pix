import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';

export default Mixin.create({

  router: service(),
  session: service('session'),
  currentUser: service(),
  authenticationRoute: 'login',

  beforeModel(transition) {
    if (!this.session.get('isAuthenticated')) {
      this.session.set('attemptedTransition', transition);
      this.router.transitionTo(this.authenticationRoute);
    } else if (this.currentUser.user.mustValidateTermsOfService) {
      this.session.set('attemptedTransition', transition);
      this.router.transitionTo('terms-of-service');
    } else {
      return this._super(...arguments);
    }
  },
});
