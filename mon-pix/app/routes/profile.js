import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ProfileRoute extends Route {
  @service currentUser;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  model() {
    return this.currentUser.user;
  }

  async afterModel(user) {
    // This reloads are necessary to keep the ui in sync when the
    // user navigates back to this route
    user.belongsTo('profile').reload();
    user.hasMany('campaignParticipations').reload();
  }
}
