import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class LogoutRoute extends Route {
  @service session;

  beforeModel() {
    super.beforeModel(...arguments);
    if (this.get('session.isAuthenticated')) {
      this.session.invalidate();
    }
  }
}
