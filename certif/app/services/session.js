import { service } from '@ember/service';
import { runTask } from 'ember-lifeline';
import SessionService from 'ember-simple-auth/services/session';
import {
  ENGLISH_INTERNATIONAL_LOCALE,
  FRENCH_FRANCE_LOCALE,
  FRENCH_INTERNATIONAL_LOCALE,
  SUPPORTED_LANGUAGES,
} from 'pix-certif/services/locale';

export default class CurrentSessionService extends SessionService {
  @service currentDomain;
  @service currentUser;
  @service locale;

  _localeFromQueryParam;

  async handleAuthentication() {
    const isFranceDomain = this.currentDomain.isFranceDomain;
    await this.currentUser.load();
    const userLocale = this.currentUser.certificationPointOfContact.lang;
    await this.handleLocale({ isFranceDomain, userLocale });

    const isCurrentUserMemberOfACertificationCenter =
      this.currentUser.certificationPointOfContact.isMemberOfACertificationCenter;
    const routeAfterAuthentication = isCurrentUserMemberOfACertificationCenter
      ? 'authenticated'
      : 'login-session-supervisor';
    super.handleAuthentication(routeAfterAuthentication);
  }

  handleInvalidation() {
    this.store.clear();
    super.handleInvalidation('/connexion');
  }

  handleLocale({ isFranceDomain, localeFromQueryParam, userLocale }) {
    if (localeFromQueryParam) {
      this._localeFromQueryParam = this.locale.handleUnsupportedLanguage(localeFromQueryParam);
    }

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

    const localeNotSupported = userLocale && !SUPPORTED_LANGUAGES.includes(userLocale);

    this.data.localeNotSupported = localeNotSupported;
    const locale = localeNotSupported ? ENGLISH_INTERNATIONAL_LOCALE : userLocale || FRENCH_INTERNATIONAL_LOCALE;

    this.locale.setLocale(locale);
  }

  waitBeforeInvalidation(millisecondsToWait) {
    return new Promise((resolve) => {
      runTask(this, resolve, millisecondsToWait);
    });
  }

  updateDataAttribute(attribute, value) {
    this.data[attribute] = value;
  }
}
