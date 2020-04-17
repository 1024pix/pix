import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default class UpdateExpiredPasswordRoute extends Route.extend(UnauthenticatedRouteMixin) {

  @service store;

  model() {
    const users = this.store.peekAll('user');
    const user = users.firstObject;

    if (!user) {
      return this.replaceWith('');
    }

    return user;
  }
}
