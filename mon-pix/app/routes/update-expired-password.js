import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default class UpdateExpiredPasswordRoute extends Route.extend(UnauthenticatedRouteMixin) {
  @service store;
  @service router;

  model() {
    const resetExpiredPasswordDemands = this.store.peekAll('reset-expired-password-demand');
    const resetExpiredPasswordDemand = resetExpiredPasswordDemands.firstObject;

    if (!resetExpiredPasswordDemand) {
      return this.router.replaceWith('');
    }

    return resetExpiredPasswordDemand;
  }
}
