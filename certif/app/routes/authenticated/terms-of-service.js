import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedTermsOfServiceRoute extends Route {

  @service currentUser;

  renderTemplate() {
    this.render('authenticated.terms-of-service', {
      into: 'application'
    });
  }

  beforeModel() {
    if (this.currentUser.user.pixCertifTermsOfServiceAccepted) {
      return this.transitionTo('authenticated.sessions.list');
    }
  }
}
