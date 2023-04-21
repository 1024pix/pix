import { inject as service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';
import get from 'lodash/get';

const FRENCH_INTERNATIONAL_LOCALE = 'fr';
const FRENCH_FRANCE_LOCALE = 'fr-FR';

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

  async handleLocale({ isFranceDomain, localeFromQueryParam, userLocale }) {
    if (localeFromQueryParam && this.intl.get('locales').includes(localeFromQueryParam)) {
      this._localeFromQueryParam = localeFromQueryParam;
    }

    if (isFranceDomain) {
      this._setLocale(FRENCH_INTERNATIONAL_LOCALE);

      if (!this.locale.hasLocaleCookie()) {
        this.locale.setLocaleCookie(FRENCH_FRANCE_LOCALE);
      }

      return;
    }

    if (this._localeFromQueryParam) {
      await this._updatePrescriberLanguage(this._localeFromQueryParam);

      this._setLocale(this._localeFromQueryParam);
      return;
    }

    const locale = userLocale || FRENCH_INTERNATIONAL_LOCALE;
    this._setLocale(locale);
  }

  _setLocale(locale) {
    this.intl.setLocale([locale, FRENCH_INTERNATIONAL_LOCALE]);
    this.dayjs.setLocale(locale);
  }

  async _updatePrescriberLanguage(lang) {
    const prescriber = this.currentUser.prescriber;

    if (!prescriber || prescriber.lang === lang) return;

    try {
      prescriber.lang = lang;
      await prescriber.save({ adapterOptions: { lang } });
    } catch (error) {
      const status = get(error, 'errors[0].status');
      if (status === '400') {
        prescriber.rollbackAttributes();
      } else {
        throw error;
      }
    }
  }

  _getRouteAfterInvalidation() {
    const alternativeRootURL = this.alternativeRootURL;
    this.alternativeRootURL = null;

    return alternativeRootURL ? alternativeRootURL : this.url.homeUrl;
  }
}
