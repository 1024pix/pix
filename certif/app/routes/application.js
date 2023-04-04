import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

const FRENCH_LOCALE = 'fr-FR';

export default class ApplicationRoute extends Route {
  @service currentUser;
  @service featureToggles;
  @service intl;
  @service currentDomain;
  @service dayjs;
  @service locale;

  async beforeModel(transition) {
    await this.featureToggles.load();
    const locale = transition.to.queryParams.lang;
    await this.handleLocale(locale);
    return this._loadCurrentUser();
  }

  _loadCurrentUser() {
    return this.currentUser.load();
  }

  async handleLocale(localeFromQueryParam) {
    const domain = this.currentDomain.getExtension();
    const defaultLocale = 'fr';
    const domainFr = 'fr';

    if (domain === domainFr) {
      this._setLocale(domainFr);

      if (!this.locale.hasLocaleCookie()) {
        this.locale.setLocaleCookie(FRENCH_LOCALE);
      }

      return;
    }

    if (localeFromQueryParam) {
      this._setLocale(localeFromQueryParam);
    } else {
      this._setLocale(defaultLocale);
    }
  }

  _setLocale(locale) {
    const defaultLocale = 'fr';
    this.intl.setLocale([locale, defaultLocale]);
    this.dayjs.setLocale(locale);
    this.dayjs.self.locale(locale);
  }
}
