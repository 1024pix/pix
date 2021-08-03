/* eslint-disable ember/no-controller-access-in-routes */
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import RSVP from 'rsvp';

export default class CertificationInformationsRoute extends Route {

  async model() {
    return RSVP.hash({
      certification: this.modelFor('authenticated.certifications.certification').reload(),
      countries: this.store.findAll('country'),
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.certificationId = model.certification.id;
    controller.certificationStatus = model.certification.status;
    controller.send('onCheckMarks');
  }

  @action
  willTransition(transition) {
    if (this.controller.edition &&
      !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
      transition.abort();
    } else {
      this.controller.edition = false;
      return true;
    }
  }
}
