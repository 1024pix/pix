import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SendProfileRoute extends Route {
  @service currentUser;

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
    await user.hasMany('scorecards').reload();
  }
}
