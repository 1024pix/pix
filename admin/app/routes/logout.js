import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class LogoutRoute extends Route {
  @service router;
  @service session;

  beforeModel() {
    this.session.invalidate();
    return this.router.transitionTo('login');
  }
}
