import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default class JoinRoute extends Route.extend(UnauthenticatedRouteMixin) {
  beforeModel(transition) {
    if (!transition.from) {
      return this.replaceWith('campaigns.entry-point');
    }
    super.beforeModel(...arguments);
  }

  async model() {
    return this.modelFor('campaigns');
  }
}
