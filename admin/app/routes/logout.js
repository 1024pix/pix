import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default class LogoutRoute extends Route.extend(UnauthenticatedRouteMixin) {

  @service session;

  beforeModel() {
    super.beforeModel(...arguments);
    this.session.invalidate();
    return this.transitionTo('login');
  }
}
