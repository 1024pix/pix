import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class StartRoute extends Route {
  @service currentUser;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  model() {
    const user = this.currentUser.user;
    return user.belongsTo('isCertifiable').reload();
  }
}
