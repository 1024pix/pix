import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class StartRoute extends Route {
  @service store;
  @service router;

  async model(params) {
    const certificationCandidate = await this.store.findRecord(
      'certification-candidate',
      params.certification_candidate_id,
    );

    const hasSeenCertificationInstructions = certificationCandidate?.hasSeenCertificationInstructions;

    if (!hasSeenCertificationInstructions) {
      this.router.replaceWith('authenticated.certifications.information', params.certification_candidate_id);
    }

    return { certificationCandidate };
  }
}
