import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SendProfileRoute extends Route {
  @service currentUser;
  @service store;

  async model() {
    const user = this.currentUser.user;
    const campaign = this.modelFor('campaigns');
    const campaignParticipation = await this.store.queryRecord('campaignParticipation', { campaignId: campaign.id, userId: user.id });
    return {
      campaign,
      campaignParticipation,
      user,
    };
  }

  async afterModel({ user }) {
    await user.hasMany('scorecards').reload();
    await user.belongsTo('pixScore').reload();
  }
}
