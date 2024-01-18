import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class IndexRoute extends Route {
  @service router;
  @service currentUser;
  beforeModel() {
    if (this.currentUser.shouldAccessMissionsPage) {
      return this.router.replaceWith('authenticated.missions');
    } else {
      return this.router.replaceWith('authenticated.campaigns');
    }
  }
}
