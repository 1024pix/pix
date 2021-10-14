import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

export default class Entrance extends Route.extend(SecuredRouteMixin) {
  model() {
    return this.modelFor('campaigns');
  }

  redirect(campaign) {
    if (campaign.isProfilesCollection) {
      this.replaceWith('campaigns.profiles-collection.start-or-resume', campaign);
    } else {
      this.replaceWith('campaigns.assessment.start-or-resume', campaign);
    }
  }
}
