import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import trim from 'lodash/trim';

export default class CertificationsController extends Controller {
  @service router;

  @tracked inputId;

  @action
  loadCertification(event) {
    event.preventDefault();
    const certifId = trim(this.inputId);
    const routeName = 'authenticated.certifications.certification';
    this.router.transitionTo(routeName, certifId);
  }
}
