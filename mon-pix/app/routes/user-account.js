import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class UserAccountRoute extends Route {

  @service currentUser;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  model() {
    return this.currentUser.user;
  }
}
