import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class StartRoute extends Route {
  @service store;
  @service router;
  @service featureToggles;
  hasSeenCertificationInstructions = false;

  beforeModel(transition) {
    this.hasSeenCertificationInstructions = transition.to.queryParams.isConfirmationCheckboxChecked;
  }

  async model(params) {
    const certificationCandidateSubscription = await this.store.findRecord(
      'certification-candidate-subscription',
      params.certification_candidate_id,
    );

    if (
      !this.hasSeenCertificationInstructions &&
      certificationCandidateSubscription.isSessionVersion3 &&
      this.featureToggles.featureToggles.areV3InfoScreensEnabled
    ) {
      this.router.replaceWith('authenticated.certifications.information', params.certification_candidate_id);
    }

    return certificationCandidateSubscription;
  }
}
