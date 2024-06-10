import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service router;
  @service currentUser;

  beforeModel() {
    if (!this.currentUser.canAccessCampaignsPage) {
      return this.router.replaceWith(this.currentUser.homePage);
    }
    return this.router.replaceWith('authenticated.campaigns.list.my-campaigns');
  }
}
