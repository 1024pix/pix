import { inject as service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';
import get from 'lodash/get';

const DEFAULT_FRENCH_LOCALE = 'fr';

export default class CurrentSessionService extends SessionService {
  @service currentUser;
  @service intl;
  @service moment;
  @service url;

  routeAfterAuthentication = 'authenticated';

  async handleAuthentication() {
    await this.handlePrescriberLanguageAndLocale();
    super.handleAuthentication(this.routeAfterAuthentication);
  }

  async handleInvalidation() {
    const routeAfterInvalidation = this._getRouteAfterInvalidation();
    await super.handleInvalidation(routeAfterInvalidation);
  }

  async handlePrescriberLanguageAndLocale(lang = null) {
    await this.currentUser.load();
    await this._updatePrescriberLanguage(lang);
    this._setLocale(lang);
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

  _setLocale(lang) {
    let locale = DEFAULT_FRENCH_LOCALE;

    if (!this.url.isFrenchDomainExtension) {
      locale = this.intl.get('locales').includes(lang) ? lang : DEFAULT_FRENCH_LOCALE;
    }

    this.intl.setLocale([locale, DEFAULT_FRENCH_LOCALE]);
    this.moment.setLocale(locale);
  }

  _getRouteAfterInvalidation() {
    const alternativeRootURL = this.alternativeRootURL;
    this.alternativeRootURL = null;

    return alternativeRootURL ? alternativeRootURL : this.url.homeUrl;
  }
}
