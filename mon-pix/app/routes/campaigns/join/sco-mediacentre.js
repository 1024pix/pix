import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ScoMediacentreRoute extends Route {
  @service session;

  beforeModel() {
    this.session.prohibitAuthentication('authenticated.user-dashboard');
  }

  model() {
    return this.modelFor('campaigns');
  }
}
