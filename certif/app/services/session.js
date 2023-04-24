import { inject as service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';

const FRENCH_INTERNATIONAL_LOCALE = 'fr';
const FRENCH_FRANCE_LOCALE = 'fr-FR';

export default class CurrentSessionService extends SessionService {
  @service currentDomain;
  @service currentUser;
  @service locale;
  @service intl;
  @service dayjs;

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
    super.handleInvalidation('/connexion');
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
      this._setLocale(this._localeFromQueryParam);
      return;
    }

    const locale = userLocale || FRENCH_INTERNATIONAL_LOCALE;
    this._setLocale(locale);
  }

  _setLocale(locale) {
    this.intl.setLocale([locale, FRENCH_INTERNATIONAL_LOCALE]);
    this.dayjs.setLocale(locale);
    this.dayjs.self.locale(locale);
  }
}
