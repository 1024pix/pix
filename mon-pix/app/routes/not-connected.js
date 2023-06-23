import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class NotConnectedRoute extends Route {
  @service session;

  beforeModel() {
    this.session.prohibitAuthentication('authenticated.user-dashboard');
  }
}
