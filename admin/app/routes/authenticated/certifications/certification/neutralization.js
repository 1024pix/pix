import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class CertificationNeutralizationRoute extends Route {
  @service store;

  async model() {
    const { certification_id } = this.paramsFor('authenticated.certifications.certification');
    return this.store.findRecord('certification-details', certification_id);
  }
}
