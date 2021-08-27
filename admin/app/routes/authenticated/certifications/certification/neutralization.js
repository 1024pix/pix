import Route from '@ember/routing/route';

export default class CertificationNeutralizationRoute extends Route {
  model() {
    const { certification_id } = this.paramsFor('authenticated.certifications.certification');
    return this.store.findRecord('certification-details', certification_id);
  }
}
