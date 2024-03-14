import EmberObject from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SessionsDetailsRoute extends Route {
  @service currentUser;
  @service store;

  beforeModel() {
    this.currentUser.checkRestrictedAccess();
  }

  async model(params) {
    const session = await this.store.findRecord('session', params.session_id);
    const loadCertificationCandidates = () =>
      this.store.query('certification-candidate', {
        sessionId: params.session_id,
      });
    const certificationCandidates = await loadCertificationCandidates();

    return EmberObject.create({
      session,
      certificationCandidates,
      async reloadCertificationCandidate() {
        const certificationCandidates = await loadCertificationCandidates();
        // eslint-disable-next-line ember/classic-decorator-no-classic-methods
        this.set('certificationCandidates', certificationCandidates);
      },
    });
  }

  afterModel(model) {
    this.currentUser.updateCurrentCertificationCenter(model.session.certificationCenterId);
  }
}
