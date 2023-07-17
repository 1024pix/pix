import Route from '@ember/routing/route';
import { service } from '@ember/service';
import get from 'lodash/get';

export default class LoginSessionSupervisorRoute extends Route {
  @service currentUser;
  @service router;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (transition.isAborted) {
      return;
    }

    const pixCertifTermsOfServiceAccepted = get(
      this.currentUser,
      'certificationPointOfContact.pixCertifTermsOfServiceAccepted',
    );
    if (!pixCertifTermsOfServiceAccepted) {
      this.router.replaceWith('terms-of-service');
    }
  }
}
