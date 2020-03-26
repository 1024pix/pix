import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CertificationsController extends Controller {
  @service router;

  @action
  loadCertification() {
    const certifId = this.inputId;
    this.router.transitionTo('authenticated.certifications.certification', certifId);
  }
}
