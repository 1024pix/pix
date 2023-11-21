import { service } from '@ember/service';
import Route from '@ember/routing/route';

const defaultLocale = 'fr';

export default class ApplicationRoute extends Route {
  @service session;
  @service intl;
  @service currentUser;
  @service featureToggles;
  @service oidcIdentityProviders;

  async beforeModel() {
    await this.session.setup();
    this.intl.setLocale([defaultLocale]);

    await this.featureToggles.load();

    await this.oidcIdentityProviders.loadReadyIdentityProviders();

    return this._loadCurrentUser();
  }

  _loadCurrentUser() {
    return this.currentUser.load();
  }
}
