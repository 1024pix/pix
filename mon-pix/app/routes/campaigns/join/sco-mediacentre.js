import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default class ScoMediacentreRoute extends Route.extend(UnauthenticatedRouteMixin) {
  @service currentUser;
  @service session;

  model() {
    return this.modelFor('campaigns');
  }
}
