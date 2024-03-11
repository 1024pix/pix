import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScoMediacentreRoute extends Route {
  @service session;

  beforeModel() {
    this.session.prohibitAuthentication('authenticated.user-dashboard');
  }

  model() {
    return this.modelFor('campaigns');
  }
}
