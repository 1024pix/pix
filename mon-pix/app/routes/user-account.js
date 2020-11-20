import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import { inject as service } from '@ember/service';

export default class UserAccountRoute extends Route.extend(SecuredRouteMixin) {

  @service currentUser;

  model() {
    return this.currentUser.user;
  }
}
