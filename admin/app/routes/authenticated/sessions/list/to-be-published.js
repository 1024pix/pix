import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class AuthenticatedSessionsListToBePublishedRoute extends Route {
  @service store;

  model() {
    return this.store.query('to-be-published-session', {});
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
