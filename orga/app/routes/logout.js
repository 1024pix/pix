import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class LogoutRoute extends Route {
  @service session;

  beforeModel() {
    if (this.session.isAuthenticated) {
      this.session.invalidate();
    }
  }
}
