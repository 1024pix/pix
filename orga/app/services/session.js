import { service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';
import { FRENCH_FRANCE_LOCALE, FRENCH_INTERNATIONAL_LOCALE } from 'pix-orga/services/locale';

export default class CurrentSessionService extends SessionService {
  @service currentDomain;
  @service currentUser;
  @service locale;
  @service intl;
  @service dayjs;
  @service url;

  _localeFromQueryParam;

  routeAfterAuthentication = 'authenticated';

  async handleAuthentication() {
    const isFranceDomain = this.currentDomain.isFranceDomain;
    await this.currentUser.load();
    const userLocale = this.currentUser.prescriber.lang;
    await this.handleLocale({ isFranceDomain, userLocale });
    super.handleAuthentication(this.routeAfterAuthentication);
  }

  async handleInvalidation() {
    const routeAfterInvalidation = this._getRouteAfterInvalidation();
    await super.handleInvalidation(routeAfterInvalidation);
  }

  handleLocale({ isFranceDomain, localeFromQueryParam, userLocale }) {
    this._localeFromQueryParam = this.locale.handleUnsupportedLanguage(localeFromQueryParam);

    if (isFranceDomain) {
      this.locale.setLocale(FRENCH_INTERNATIONAL_LOCALE);

      if (!this.locale.hasLocaleCookie()) {
        this.locale.setLocaleCookie(FRENCH_FRANCE_LOCALE);
      }

      return;
    }

    if (this._localeFromQueryParam) {
      this.locale.setLocale(this._localeFromQueryParam);
      return;
    }

    const locale = userLocale || FRENCH_INTERNATIONAL_LOCALE;
    this.locale.setLocale(locale);
  }

  waitBeforeInvalidation(millisecondsToWait) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), millisecondsToWait);
    });
  }

  _getRouteAfterInvalidation() {
    const alternativeRootURL = this.alternativeRootURL;
    this.alternativeRootURL = null;

    return alternativeRootURL ? alternativeRootURL : this.url.homeUrl;
  }
}
