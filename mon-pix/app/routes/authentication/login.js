import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class LoginRoute extends Route {
  @service session;
  @service store;
  @service router;

  beforeModel() {
    this.session.prohibitAuthentication('authenticated.user-dashboard');
  }
}
