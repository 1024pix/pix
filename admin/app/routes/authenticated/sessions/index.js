import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AuthenticatedSessionsRoute extends Route {
  @service router;

  beforeModel() {
    this.router.transitionTo('authenticated.sessions.list.with-required-action');
  }
}
