import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';

export default class ProfileAlreadySharedRoute extends Route.extend(SecuredRouteMixin) {
  async model() {
    const user = this.currentUser.user;
    const campaign = this.modelFor('campaigns');
    try {
      const sharedProfile = await this.store.queryRecord('sharedProfileForCampaign', {
        campaignId: campaign.id,
        userId: user.id,
      });
      return {
        campaign,
        sharedProfile,
        user,
      };
    } catch (error) {
      if (error.errors?.[0]?.status === '412') {
        return this.transitionTo('campaigns.entry-point', campaign.code);
      } else throw error;
    }
  }
}
