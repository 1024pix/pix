import Route from '@ember/routing/route';

export default class CertificationCandidatesRoute extends Route {
  model() {
    return this.modelFor('authenticated.sessions.details');
  }
}
