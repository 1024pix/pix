import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AuthenticatedUsersGetRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('user', params.user_id);
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
