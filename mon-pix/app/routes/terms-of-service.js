import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class TermsOfServiceRoute extends Route {
  @service currentUser;
  @service session;
  @service router;

  beforeModel(transition) {
    const isUserExternal = Boolean(this.session.data.externalUser);
    if (isUserExternal || !this.currentUser.user.mustValidateTermsOfService) {
      if (this.session.attemptedTransition) {
        this.session.attemptedTransition.retry();
      } else {
        this.router.replaceWith('');
      }
    }

    this.session.requireAuthentication(transition, 'login');
  }

  model() {
    return this.currentUser.user;
  }
}
