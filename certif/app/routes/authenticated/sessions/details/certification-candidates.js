import Route from '@ember/routing/route';

export default class AuthenticatedSessionsDetailsCertificationCandidatesRoute extends Route {
  model() {
    return this.modelFor('authenticated.sessions.details');
  }
}
