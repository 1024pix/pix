import Route from '@ember/routing/route';

export default class AuthenticatedSessionsListRoute extends Route {
  model() {
    return this.store.query('with-required-action-session', {});
  }
}
