import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class UpdateExpiredPasswordRoute extends Route {
  @service store;
  @service session;

  beforeModel() {
    this.session.prohibitAuthentication('authenticated.user-dashboard');
  }

  model() {
    const resetExpiredPasswordDemands = this.store.peekAll('reset-expired-password-demand');
    const resetExpiredPasswordDemand = resetExpiredPasswordDemands[0];

    if (!resetExpiredPasswordDemand) {
      return this.router.replaceWith('login');
    }

    return resetExpiredPasswordDemand;
  }
}
