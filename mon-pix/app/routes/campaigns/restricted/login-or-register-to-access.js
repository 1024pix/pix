import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class LoginOrRegisterToAccessRoute extends Route {

  @service session;

  beforeModel() {
    this.session.prohibitAuthentication('user-dashboard');
  }

  async model() {
    return this.modelFor('campaigns');
  }
}
