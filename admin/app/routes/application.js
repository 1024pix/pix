import Route from '@ember/routing/route';
import { service } from '@ember/service';

export const ENGLISH_INTERNATIONAL_LOCALE = 'en';
export const DEFAULT_LOCALE = ENGLISH_INTERNATIONAL_LOCALE;

export default class ApplicationRoute extends Route {
  @service session;
  @service intl;
  @service currentUser;
  @service featureToggles;

  async beforeModel() {
    await this.session.setup();
    this.intl.setLocale(DEFAULT_LOCALE);

    await this.featureToggles.load();

    return this._loadCurrentUser();
  }

  _loadCurrentUser() {
    return this.currentUser.load();
  }
}
