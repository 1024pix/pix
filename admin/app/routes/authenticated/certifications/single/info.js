import { action } from '@ember/object';
import Route from '@ember/routing/route';

export default class InfoRoute extends Route {

  model(params) {
    return this.store.findRecord('certification', params.certification_id);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    const singleCertificationController = this.controllerFor('authenticated.certifications.single');
    singleCertificationController.set('certificationId', model.get('id'));
    singleCertificationController.set('certificationStatus', model.get('status'));
    controller.send('onCheckMarks');
  }

  @action
  willTransition(transition) {
    if (this.controller.get('edition') &&
      !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
      transition.abort();
    } else {
      this.controller.set('edition', false);
      return true;
    }
  }
}
