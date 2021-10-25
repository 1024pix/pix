import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

export default class InvitedRoute extends Route.extend(SecuredRouteMixin) {
  model() {
    return this.modelFor('campaigns');
  }

  redirect(campaign) {
    return this.replaceWith('campaigns.invited.fill-in-participant-external-id', campaign);
  }
}
