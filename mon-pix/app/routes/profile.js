import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';

export default class ProfileRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;

  async model() {
    await this.currentUser.user.belongsTo('profile').reload();
    return this.currentUser.user;
  }

  @action
  loading() {
    return false;
  }
}
