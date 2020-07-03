import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import _ from 'lodash';

export default class CertificationsController extends Controller {
  @service router;

  @tracked inputId;

  @action
  loadCertification(event) {
    event.preventDefault();
    const certifId = _.trim(this.inputId);
    const routeName = 'authenticated.certifications.certification';
    this.router.transitionTo(routeName, certifId);
  }
}
