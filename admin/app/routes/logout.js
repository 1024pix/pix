import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class LogoutRoute extends Route {

  @service session;

  beforeModel() {
    this.session.prohibitAuthentication('index');

    this.session.invalidate();
    return this.transitionTo('login');
  }
}
