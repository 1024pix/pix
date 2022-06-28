import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

export default class JoinRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;

  model() {
    const user = this.currentUser.user;
    return user.belongsTo('isCertifiable').reload();
  }

  @action
  loading() {
    return false;
  }
}
