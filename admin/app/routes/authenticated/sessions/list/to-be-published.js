import Route from '@ember/routing/route';

export default class AuthenticatedSessionsListToBePublishedRoute extends Route {
  model() {
    return this.store.query('to-be-published-session', {});
  }
}
