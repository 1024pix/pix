import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import { inject as service } from '@ember/service';

export default class JoinRoute extends Route.extend(UnauthenticatedRouteMixin) {
  @service router;

  beforeModel(transition) {
    if (!transition.from) {
      return this.router.replaceWith('campaigns.entry-point');
    }
    this.routeIfAlreadyAuthenticated = 'campaigns.access';
    super.beforeModel(...arguments);
  }

  async model() {
    return this.modelFor('campaigns');
  }
}
