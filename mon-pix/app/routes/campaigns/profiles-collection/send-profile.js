import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SendProfileRoute extends Route {
  @service currentUser;
  @service session;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  async model() {
    const user = this.currentUser.user;
    const { campaign, campaignParticipation } = this.modelFor('campaigns.profiles-collection');
    return {
      campaign,
      campaignParticipation,
      user,
    };
  }

  async afterModel({ user }) {
    await user.belongsTo('profile').reload();
  }
}
