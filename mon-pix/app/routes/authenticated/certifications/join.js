import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class JoinRoute extends Route {
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
