import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class LogoutRoute extends Route {
  @service router;
  @service session;

  beforeModel() {
    this.session.invalidate();
    return this.router.transitionTo('login');
  }
}
