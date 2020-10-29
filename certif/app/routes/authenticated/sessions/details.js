import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import EmberObject from '@ember/object';

export default class SessionsDetailsRoute extends Route {
  @service currentUser;

  async model(params) {
    const session = await this.store.findRecord('session', params.session_id);
    const loadCertificationCandidates = () => this.store.query('certification-candidate', {
      sessionId: params.session_id,
    });
    const certificationCandidates = await loadCertificationCandidates();
    const isUserFromSco = this.currentUser.isFromSco;
    const featureToggles = this.store.peekRecord('feature-toggle', 0);
    const isCertifPrescriptionScoEnabled = featureToggles.certifPrescriptionSco;

    return EmberObject.create({
      session,
      certificationCandidates,
      isUserFromSco,
      isCertifPrescriptionScoEnabled,
      async reloadCertificationCandidate() {
        const certificationCandidates = loadCertificationCandidates();
        this.set('certificationCandidates', certificationCandidates);
      },
    });
  }
}
