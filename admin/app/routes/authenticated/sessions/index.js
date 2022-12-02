import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class AuthenticatedSessionsRoute extends Route {
  @service router;

  beforeModel() {
    this.router.transitionTo('authenticated.sessions.list');
  }
}
