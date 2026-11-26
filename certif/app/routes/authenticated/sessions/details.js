import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

class SessionDetailsModel {
  @tracked certificationCandidates;

  constructor({ session, sessionManagement, certificationCandidates, loadCertificationCandidates }) {
    this.session = session;
    this.sessionManagement = sessionManagement;
    this.certificationCandidates = certificationCandidates;
    this.loadCertificationCandidates = loadCertificationCandidates;
  }

  async reloadCertificationCandidate() {
    this.certificationCandidates = await this.loadCertificationCandidates();
  }
}

export default class SessionsDetailsRoute extends Route {
  @service currentUser;
  @service store;

  beforeModel() {
    this.currentUser.checkRestrictedAccess();
  }

  async model(params) {
    const sessionEnrolment = await this.store.findRecord('session-enrolment', params.session_id);
    const sessionManagement = await this.store.findRecord('session-management', params.session_id);
    const loadCertificationCandidates = () =>
      this.store.query('certification-candidate', {
        sessionId: params.session_id,
      });
    const certificationCandidates = await loadCertificationCandidates();

    return new SessionDetailsModel({
      session: sessionEnrolment,
      sessionManagement,
      certificationCandidates,
      loadCertificationCandidates,
    });
  }

  afterModel(model) {
    this.currentUser.updateCurrentCertificationCenter(model.session.certificationCenterId);
  }
}
