import Route from '@ember/routing/route';

export default class AuthenticatedSessionsWithRequiredActionListRoute extends Route {
  model() {
    return this.modelFor('authenticated.sessions.list');
  }
}
