import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default class LoginOrRegisterToAccessRestrictedCampaignRoute extends Route.extend(UnauthenticatedRouteMixin) {

  beforeModel() {
    return super.beforeModel(...arguments);
  }

  model() {
    return this.modelFor('campaigns');
  }
}
