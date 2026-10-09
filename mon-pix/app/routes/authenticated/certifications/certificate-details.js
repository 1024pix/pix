import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CertificateDetails extends Route {
  @service store;
  @service router;

  /**
   * @param {Transition} transition
   */
  async beforeModel(transition) {
    const certificateId = transition.to.params.id;
    const certificationsSummaries = await this.store.findAll('certificate-summary');
    const certificateSummary = certificationsSummaries.find(
      (certificateSummary) => certificateSummary.id === certificateId,
    );
    if (!certificateSummary || !certificateSummary.isValidated) {
      transition.abort();
      this.router.transitionTo('authenticated.certifications');
    }
  }

  model(params) {
    return this.store.findRecord('certification', params.id, { reload: true });
  }
}
