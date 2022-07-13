import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service session;
  @service store;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  model() {
    return this.store.findAll('certification');
  }

  @action
  loading() {
    return false;
  }
}
