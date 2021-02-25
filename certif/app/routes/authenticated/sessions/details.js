/* eslint-disable ember/classic-decorator-no-classic-methods*/

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
    const isScoManagingStudents = this.currentUser.currentCertificationCenter.isScoManagingStudents;
    const featureToggles = this.store.peekRecord('feature-toggle', 0);
    const isReportsCategorizationFeatureToggleEnabled = featureToggles.reportsCategorization;
    const shouldDisplayPrescriptionScoStudentRegistrationFeature = isScoManagingStudents;

    return EmberObject.create({
      session,
      certificationCandidates,
      shouldDisplayPrescriptionScoStudentRegistrationFeature,
      isReportsCategorizationFeatureToggleEnabled,
      async reloadCertificationCandidate() {
        const certificationCandidates = await loadCertificationCandidates();
        this.set('certificationCandidates', certificationCandidates);
      },
    });
  }
}
