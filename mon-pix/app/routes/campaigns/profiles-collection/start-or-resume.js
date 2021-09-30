import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

export default class ProfilesCollectionCampaignsStartOrResumeRoute extends Route.extend(SecuredRouteMixin) {

  async model() {
    return this.modelFor('campaigns.profiles-collection');
  }

  redirect({ campaign, campaignParticipation }) {
    if (campaignParticipation.isShared) {
      return this.replaceWith('campaigns.profiles-collection.profile-already-shared', campaign.code);
    }
    return this.replaceWith('campaigns.profiles-collection.send-profile', campaign.code);
  }
}
