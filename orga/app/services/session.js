import { inject as service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';
import get from 'lodash/get';

const DEFAULT_LOCALE = 'fr';
const FRENCH_LOCALE = 'fr-FR';

export default class CurrentSessionService extends SessionService {
  @service currentUser;
  @service intl;
  @service dayjs;
  @service url;
  @service currentDomain;
  @service locale;

  routeAfterAuthentication = 'authenticated';

  async handleAuthentication() {
    await this.handlePrescriberLanguageAndLocale();
    super.handleAuthentication(this.routeAfterAuthentication);
  }

  async handleInvalidation() {
    const routeAfterInvalidation = this._getRouteAfterInvalidation();
    await super.handleInvalidation(routeAfterInvalidation);
  }

  async handlePrescriberLanguageAndLocale(localeFromQueryParam) {
    const domain = this.currentDomain.getExtension();
    const defaultLocale = 'fr';
    const domainFr = 'fr';

    await this.currentUser.load();
    await this._updatePrescriberLanguage(localeFromQueryParam);

    if (domain === domainFr) {
      this._setLocale(defaultLocale);

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

  async _updatePrescriberLanguage(lang) {
    const prescriber = this.currentUser.prescriber;

    if (!prescriber || !lang || prescriber.lang === lang) return;

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

  _setLocale(locale) {
    let userLocale = DEFAULT_LOCALE;

    if (!this.url.isFrenchDomainExtension) {
      userLocale = this.intl.get('locales').includes(locale) ? locale : DEFAULT_LOCALE;
    }

    this.intl.setLocale([userLocale, DEFAULT_LOCALE]);
    this.dayjs.setLocale(userLocale);
    this.dayjs.self.locale(userLocale);
  }

  _getRouteAfterInvalidation() {
    const alternativeRootURL = this.alternativeRootURL;
    this.alternativeRootURL = null;

    return alternativeRootURL ? alternativeRootURL : this.url.homeUrl;
  }
}
