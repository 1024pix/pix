import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service router;
  @service currentUser;

  beforeModel() {
    if (this.currentUser.shouldAccessMissionsPage) {
      return this.router.replaceWith('authenticated.missions');
    }
    return this.router.replaceWith('authenticated.campaigns.list.my-campaigns');
  }
}
