import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class TermsOfServiceRoute extends Route {
  @service currentUser;
  @service router;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (transition.isAborted) {
      return;
    }

    const pixCertifTermsOfServiceStatus = this.currentUser.certificationPointOfContact?.pixCertifTermsOfServiceStatus;

    if (pixCertifTermsOfServiceStatus === 'accepted') {
      this.router.replaceWith('');
    }
  }

  model() {
    return {
      legalDocumentStatus: this.currentUser.certificationPointOfContact?.pixCertifTermsOfServiceStatus,
      legalDocumentPath: this.currentUser.certificationPointOfContact?.pixCertifTermsOfServiceDocumentPath,
    };
  }
}
