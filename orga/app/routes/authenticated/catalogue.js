import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AuthenticatedCatalogue extends Route {
  @service currentUser;
  @service router;

  beforeModel() {
    if (!this.currentUser.canAccessCampaignsPage) {
      return this.router.replaceWith('authenticated.index');
    }
  }
}
