import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default class LoginOrRegisterToAccessRoute extends Route.extend(UnauthenticatedRouteMixin) {
  @service campaignStorage;

  async model() {
    return this.modelFor('campaigns');
  }

  setupController(controller, campaign) {
    controller.displayRegisterForm = !this.campaignStorage.get(campaign.code, 'hasUserSeenJoinPage');
  }
}
