import Route from '@ember/routing/route';
export default class CertificationDetailsRoute extends Route {
  model() {
    return this.modelFor('authenticated.certifications');
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.certificationId = model.id;
  }
}
