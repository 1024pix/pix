import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';

export default class SendProfileRoute extends Route.extend(SecuredRouteMixin) {
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
