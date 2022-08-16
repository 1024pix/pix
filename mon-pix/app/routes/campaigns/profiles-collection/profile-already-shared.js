import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ProfileAlreadySharedRoute extends Route.extend(SecuredRouteMixin) {
  @service router;
  @service store;

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
        this.router.transitionTo('campaigns.entry-point', campaign.code);
        return;
      } else throw error;
    }
  }
}
