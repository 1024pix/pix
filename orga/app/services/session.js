import { service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';
import {
  ENGLISH_INTERNATIONAL_LOCALE,
  FRENCH_FRANCE_LOCALE,
  FRENCH_INTERNATIONAL_LOCALE,
  SUPPORTED_LANGUAGES,
} from 'pix-orga/services/locale';

export default class CurrentSessionService extends SessionService {
  @service currentDomain;
  @service currentUser;
  @service locale;
  @service intl;
  @service dayjs;
  @service url;

  routeAfterAuthentication = 'authenticated';

  async handleAuthentication() {
    const isFranceDomain = this.currentDomain.isFranceDomain;
    await this.currentUser.load();
    const userLocale = this.currentUser.prescriber.lang;
    await this.handleLocale({ isFranceDomain, userLocale });
    super.handleAuthentication(this.routeAfterAuthentication);
  }

  async handleInvalidation() {
    this.store.clear();
    const routeAfterInvalidation = this._getRouteAfterInvalidation();
    await super.handleInvalidation(routeAfterInvalidation);
  }

  handleLocale({ isFranceDomain, localeFromQueryParam, userLocale }) {
    if (isFranceDomain) {
      this.locale.setLocale(FRENCH_INTERNATIONAL_LOCALE);

      if (!this.locale.hasLocaleCookie()) {
        this.locale.setLocaleCookie(FRENCH_FRANCE_LOCALE);
      }

      return;
    }

    if (localeFromQueryParam && this.locale.isLanguageSupported(localeFromQueryParam)) {
      this.locale.setLocale(localeFromQueryParam);
      return;
    }

    if (!userLocale) {
      this.locale.setLocale(FRENCH_INTERNATIONAL_LOCALE);
      return;
    }

    const localeNotSupported = !SUPPORTED_LANGUAGES.includes(userLocale);
    const locale = localeNotSupported ? ENGLISH_INTERNATIONAL_LOCALE : userLocale;

    this.data.localeNotSupported = localeNotSupported;
    this.locale.setLocale(locale);
  }

  waitBeforeInvalidation(millisecondsToWait) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), millisecondsToWait);
    });
  }

  updateDataAttribute(attribute, value) {
    this.data[attribute] = value;
  }

  _getRouteAfterInvalidation() {
    const alternativeRootURL = this.alternativeRootURL;
    this.alternativeRootURL = null;

    return alternativeRootURL ? alternativeRootURL : this.url.homeUrl;
  }
}
