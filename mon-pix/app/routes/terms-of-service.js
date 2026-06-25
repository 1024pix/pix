import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class TermsOfServiceRoute extends Route {
  @service currentUser;
  @service session;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'authentication');

    const mustSkipTos =
      this.session.isAuthenticatedByGar ||
      this.currentUser.user.pixAppTermsOfServiceStatus === 'accepted' ||
      this.currentUser.user.pixAppTermsOfServiceStatus === 'not-applicable';

    if (mustSkipTos) {
      if (this.session.attemptedTransition) {
        this.session.attemptedTransition.retry();
      } else {
        this.router.replaceWith('');
      }
    }
  }

  model() {
    return this.currentUser.user;
  }
}
