import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { action } from '@ember/object';

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
