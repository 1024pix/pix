import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class FillInCertificateVerificationCodeRoute extends Route {

  @service intl;

  message = null;

  beforeModel(transition) {
    if (transition.to.queryParams.unallowedAccess) {
      this.message = this.intl.t('pages.fill-in-certificate-verification-code.errors.unallowed-access');
    }
  }

  setupController(controller) {
    controller.errorMessage = this.message;
  }
}
