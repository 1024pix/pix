import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

const defaultLocale = 'fr';

export default class ApplicationRoute extends Route {
  @service intl;
  @service currentUser;
  @service featureToggles;
  @service oidcIdentityProviders;

  async beforeModel() {
    this.intl.setLocale([defaultLocale]);

    await this.featureToggles.load();

    await this.oidcIdentityProviders.load().catch();

    return this._loadCurrentUser();
  }

  _loadCurrentUser() {
    return this.currentUser.load();
  }
}
