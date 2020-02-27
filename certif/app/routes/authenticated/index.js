import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedIndexRoute extends Route {

  @service currentUser;

  beforeModel() {
    const transition = this._selectTransition(this.currentUser);

    return this.transitionTo(transition);
  }

  _selectTransition({ pixCertifTermsOfServiceAccepted }) {
    if (!pixCertifTermsOfServiceAccepted) {
      return 'terms-of-service';
    }

    return 'authenticated.sessions.list';
  }
}
