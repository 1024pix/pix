import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class AuthenticatedSessionsListToBePublishedRoute extends Route {
  model() {
    return this.store.query('to-be-published-session', {});
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
