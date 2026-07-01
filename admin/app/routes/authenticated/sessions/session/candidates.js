import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CandidatesRoute extends Route {
  @service currentUser;
  @service store;

  async model() {
    const session = this.modelFor('authenticated.sessions.session');
    const certificationCandidates = await this.store.query('certification-candidate', {
      sessionId: session.id,
    });
    return { session, certificationCandidates };
  }
}
