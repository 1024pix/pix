/* eslint-disable ember/no-controller-access-in-routes */
import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class CertificationInformationsRoute extends Route {

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.certificationId = model.id;
    controller.certificationStatus = model.status;
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
