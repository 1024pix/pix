import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ParametersRoute extends Route {
  @service currentUser;

  beforeModel() {
    this.currentUser.checkRestrictedAccess();
  }

  model() {
    return this.modelFor('authenticated.sessions.details');
  }
}
