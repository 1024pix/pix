import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import { inject as service } from '@ember/service';

export default class ProfilesCollectionCampaignsStartOrResumeRoute extends Route.extend(SecuredRouteMixin) {
  @service router;

  async model() {
    return this.modelFor('campaigns.profiles-collection');
  }

  redirect({ campaign, campaignParticipation }) {
    if (campaignParticipation.isShared) {
      return this.router.replaceWith('campaigns.profiles-collection.profile-already-shared', campaign.code);
    }
    return this.router.replaceWith('campaigns.profiles-collection.send-profile', campaign.code);
  }
}
