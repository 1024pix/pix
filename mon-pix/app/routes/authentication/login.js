import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class LoginRoute extends Route {
  @service currentUser;
  @service session;
  @service store;
  @service router;

  beforeModel() {
    if (!this.currentUser?.user?.isAnonymous) {
      this.session.prohibitAuthentication('authenticated.user-dashboard');
    }
  }
}
