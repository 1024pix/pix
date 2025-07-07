import Route from '@ember/routing/route';
import { service } from '@ember/service';
import get from 'lodash/get';

export default class AuthenticatedRoute extends Route {
  @service currentUser;
  @service router;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (transition.isAborted) {
      return;
    }

    if (!this.currentUser.certificationPointOfContact.isMemberOfACertificationCenter) {
      this.router.replaceWith('login-session-supervisor');
    }

    const pixCertifTermsOfServiceAccepted = get(
      this.currentUser,
      'certificationPointOfContact.pixCertifTermsOfServiceAccepted',
    );
    if (!pixCertifTermsOfServiceAccepted) {
      this.router.replaceWith('terms-of-service');
    }
  }

  model() {
    return this.currentUser.currentAllowedCertificationCenterAccess;
  }
}
