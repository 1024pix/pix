import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ApplicationRoute extends Route {
  @service currentUser;
  @service featureToggles;
  @service oidcIdentityProviders;

  async beforeModel() {
    await this.featureToggles.load();

    await this.oidcIdentityProviders.load().catch();

    return this._loadCurrentUser();
  }

  _loadCurrentUser() {
    return this.currentUser.load();
  }
}
