import Route from '@ember/routing/route';

export default class CertificationInformationsRoute extends Route {

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.certificationId = model.id;
    controller.certificationStatus = model.status;
    controller.send('onCheckMarks');
  }
}
