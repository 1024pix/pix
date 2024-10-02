import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class StartRoute extends Route {
  @service store;
  @service router;
  @service featureToggles;

  async model(params) {
    const [certificationCandidate, certificationCandidateSubscription] = await Promise.all([
      this.store.findRecord('certification-candidate', params.certification_candidate_id),
      this.store.findRecord('certification-candidate-subscription', params.certification_candidate_id),
    ]);

    const hasSeenCertificationInstructions = certificationCandidate?.hasSeenCertificationInstructions;

    if (
      !hasSeenCertificationInstructions &&
      certificationCandidateSubscription.isSessionVersion3 &&
      this.featureToggles.featureToggles.areV3InfoScreensEnabled
    ) {
      this.router.replaceWith('authenticated.certifications.information', params.certification_candidate_id);
    }

    return certificationCandidateSubscription;
  }
}
