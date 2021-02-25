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
    const shouldDisplayPrescriptionScoStudentRegistrationFeature = this.currentUser.currentCertificationCenter.isScoManagingStudents;

    return EmberObject.create({
      session,
      certificationCandidates,
      shouldDisplayPrescriptionScoStudentRegistrationFeature,
      async reloadCertificationCandidate() {
        const certificationCandidates = await loadCertificationCandidates();
        this.set('certificationCandidates', certificationCandidates);
      },
    });
  }
}
