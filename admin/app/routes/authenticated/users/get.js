import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class AuthenticatedUsersGetRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('user', params.user_id, { include: 'schoolingRegistrations,authenticationMethods' });
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
