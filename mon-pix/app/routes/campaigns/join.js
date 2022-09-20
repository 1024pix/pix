import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class JoinRoute extends Route {
  @service session;
  @service router;

  beforeModel(transition) {
    if (!transition.from) {
      return this.router.replaceWith('campaigns.entry-point');
    }
    this.session.prohibitAuthentication('authenticated.user-dashboard');
    this.routeIfAlreadyAuthenticated = 'campaigns.access';

    super.beforeModel(...arguments);
  }

  async model() {
    return this.modelFor('campaigns');
  }
}
