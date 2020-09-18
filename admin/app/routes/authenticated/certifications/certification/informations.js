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
    // eslint-disable-next-line ember/no-controller-access-in-routes
    if (this.controller.edition &&
      !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
      transition.abort();
    } else {
      // eslint-disable-next-line ember/no-controller-access-in-routes
      this.controller.edition = false;
      return true;
    }
  }
}
