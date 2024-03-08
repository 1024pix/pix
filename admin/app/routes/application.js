import Route from '@ember/routing/route';
import { service } from '@ember/service';

const defaultLocale = 'fr';

export default class ApplicationRoute extends Route {
  @service session;
  @service intl;
  @service currentUser;
  @service featureToggles;

  async beforeModel() {
    await this.session.setup();
    this.intl.setLocale([defaultLocale]);

    await this.featureToggles.load();

    return this._loadCurrentUser();
  }

  _loadCurrentUser() {
    return this.currentUser.load();
  }
}
