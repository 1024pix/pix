import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CertificationDetailsRoute extends Route {
  @service store;

  model() {
    const certificationVersion = this.modelFor('authenticated.certifications.certification').version;
    const { certification_id } = this.paramsFor('authenticated.certifications.certification');
    if (certificationVersion === 3) {
      return this.store.findRecord('v3-certification-course-details-for-administration', certification_id);
    }
    return this.store.findRecord('certification-details', certification_id);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.certificationId = model.id;
  }
}
