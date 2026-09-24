import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AuthenticatedSessionsAddCandidateRoute extends Route {
  @service currentUser;
  @service router;
  @service store;

  beforeModel() {
    this.currentUser.checkRestrictedAccess();
  }

  async model(params) {
    const sessionManagement = await this.store.findRecord('session-management', params.session_id);

    if (sessionManagement.hasExpired) {
      return this.router.replaceWith('authenticated.sessions');
    }

    const session = await this.store.findRecord('session-enrolment', params.session_id);
    const certificationCandidates = await this.store.query('certification-candidate', {
      sessionId: params.session_id,
    });

    let countries = this.store.peekAll('country');
    if (countries.length === 0) {
      countries = await this.store.findAll('country');
    }

    return { session, countries, certificationCandidates };
  }

  afterModel(model) {
    this.currentUser.updateCurrentCertificationCenter(model.session.certificationCenterId);
  }
}
