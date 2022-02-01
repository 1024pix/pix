import Route from '@ember/routing/route';

export default class AuthenticatedSessionsRoute extends Route {
  beforeModel() {
    this.transitionTo('authenticated.sessions.list');
  }
}
