import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ProfileRoute extends Route {
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
