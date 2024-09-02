import { service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';
import get from 'lodash/get';
import ENV from 'mon-pix/config/environment';
import { FRENCH_FRANCE_LOCALE, FRENCH_INTERNATIONAL_LOCALE } from 'mon-pix/services/locale';

const FRANCE_TLD = 'fr';

export default class CurrentSessionService extends SessionService {
  @service currentUser;
  @service currentDomain;
  @service intl;
  @service dayjs;
  @service url;
  @service router;
  @service oidcIdentityProviders;
  @service locale;

  routeAfterAuthentication = 'authenticated.user-dashboard';

  async authenticateUser(login, password) {
    await this._removeExternalUserContext();

    const trimedLogin = login ? login.trim() : '';
    const scope = ENV.APP.AUTHENTICATION.SCOPE;
    return this.authenticate('authenticator:oauth2', { login: trimedLogin, password, scope });
  }

  async _removeExternalUserContext() {
    if (this.data && this.data.expectedUserId) {
      delete this.data.expectedUserId;
    }
    if (this.data && this.data.externalUser) {
      delete this.data.externalUser;
    }
  }

  async handleAuthentication() {
    await this._loadCurrentUserAndSetLocale();

    const nextURL = this.data.nextURL;
    const isFromIdentityProviderLoginPage = this.oidcIdentityProviders.list.some((identityProvider) => {
      const isUserLoggedInToIdentityProvider =
        get(this, 'data.authenticated.identityProviderCode') === identityProvider.code;
      return nextURL && isUserLoggedInToIdentityProvider;
    });

    if (isFromIdentityProviderLoginPage) {
      // eslint-disable-next-line ember/classic-decorator-no-classic-methods
      this.set('data.nextURL', undefined);
      this.router.replaceWith(nextURL);
      return;
    }

    super.handleAuthentication(this.routeAfterAuthentication);
  }

  handleInvalidation() {
    if (this.skipRedirectAfterSessionInvalidation) {
      delete this.skipRedirectAfterSessionInvalidation;
      return;
    }

    const routeAfterInvalidation = this._getRouteAfterInvalidation();
    super.handleInvalidation(routeAfterInvalidation);
  }

  async handleUserLanguageAndLocale(transition = null) {
    const language = this.locale.handleUnsupportedLanguage(transition?.to?.queryParams?.lang);
    await this._loadCurrentUserAndSetLocale(language);
  }

  requireAuthenticationAndApprovedTermsOfService(transition, authenticationRoute) {
    if (this.isAuthenticated && this.currentUser.user.mustValidateTermsOfService) {
      this.attemptedTransition = transition;
      this.router.transitionTo('terms-of-service');
    }
    const transitionRoute = authenticationRoute ? authenticationRoute : 'authentication.login';
    super.requireAuthentication(transition, transitionRoute);
  }

  setAttemptedTransition(transition) {
    this.attemptedTransition = transition;
  }

  async _loadCurrentUserAndSetLocale(locale = null) {
    await this.currentUser.load();
    await this._handleLocale(locale);
  }

  async _handleLocale(localeFromQueryParam = null) {
    const isUserLoaded = !!this.currentUser.user;
    const domain = this.currentDomain.getExtension();

    if (domain === FRANCE_TLD) {
      this.locale.setLocale(FRENCH_INTERNATIONAL_LOCALE);

      if (!this.locale.hasLocaleCookie()) {
        this.locale.setLocaleCookie(FRENCH_FRANCE_LOCALE);
      }
      return;
    }

    if (localeFromQueryParam) {
      this.locale.setLocale(localeFromQueryParam);
      return;
    }

    if (isUserLoaded) {
      this.locale.setLocale(this.currentUser.user.lang);
      return;
    }

    this.locale.setLocale(FRENCH_INTERNATIONAL_LOCALE);
  }

  _getRouteAfterInvalidation() {
    const alternativeRootURL = this.alternativeRootURL;
    this.alternativeRootURL = null;

    return alternativeRootURL ? alternativeRootURL : this.url.homeUrl;
  }

  _logoutUser() {
    delete super.data.expectedUserId;
    delete super.data.externalUser;
    return super.invalidate();
  }
}
