import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class CertificationDetailsRoute extends Route {
  @service store;

  model() {
    const { certification_id } = this.paramsFor('authenticated.certifications.certification');
    return this.store.findRecord('certification-details', certification_id);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.certificationId = model.id;
  }
}
