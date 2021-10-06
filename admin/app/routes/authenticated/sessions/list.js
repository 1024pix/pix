import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class AuthenticatedSessionsListRoute extends Route {
  @service store;

  model() {
    return this.store.query('with-required-action-session', {});
  }
}
