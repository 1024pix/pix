import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class AuthenticatedUsersGetRoute extends Route {

  model(params) {
    return this.store.findRecord('user', params.user_id, { include: 'schoolingRegistrations,authenticationMethods' });
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
