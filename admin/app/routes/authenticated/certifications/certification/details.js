import Route from '@ember/routing/route';

export default class CertificationDetailsRoute extends Route {  
  model() {
    const { certification_id } = this.paramsFor('authenticated.certifications.certification');
    return this.store.findRecord('certificationDetails', certification_id);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    this.controllerFor('authenticated.certifications.certification.details').certificationId = model.id;
  }
}
