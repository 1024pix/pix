import { service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';
import get from 'lodash/get';
import { DEFAULT_LOCALE, FRENCH_FRANCE_LOCALE, FRENCH_INTERNATIONAL_LOCALE } from 'mon-pix/services/locale';
import { SessionStorageEntry } from 'mon-pix/utils/session-storage-entry.js';

const FRANCE_TLD = 'fr';

const externalUserTokenFromGarStorage = new SessionStorageEntry('externalUserTokenFromGar');
const userIdForLearnerAssociationStorage = new SessionStorageEntry('userIdForLearnerAssociation');

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
    this.revokeGarAuthenticationContext();

    const trimedLogin = login ? login.trim() : '';
    return this.authenticate('authenticator:oauth2', { login: trimedLogin, password });
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

  get redirectionUrl() {
    const campaignCode = get(this.session, 'attemptedTransition.from.parent.params.code');
    if (campaignCode) {
      const baseUrl = window.location.protocol + '//' + window.location.host;
      return baseUrl + this.router.urlFor('campaigns', { code: campaignCode });
    }
    return null;
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

  get isAuthenticatedByGar() {
    return Boolean(this.externalUserTokenFromGar);
  }

  get externalUserTokenFromGar() {
    return externalUserTokenFromGarStorage.get();
  }

  set externalUserTokenFromGar(token) {
    externalUserTokenFromGarStorage.set(token);
  }

  get userIdForLearnerAssociation() {
    return userIdForLearnerAssociationStorage.get();
  }

  set userIdForLearnerAssociation(userId) {
    userIdForLearnerAssociationStorage.set(userId);
  }

  revokeGarExternalUserToken() {
    externalUserTokenFromGarStorage.remove();
  }

  revokeGarAuthenticationContext() {
    externalUserTokenFromGarStorage.remove();
    userIdForLearnerAssociationStorage.remove();
  }

  async _loadCurrentUserAndSetLocale(locale = null) {
    await this.currentUser.load();
    await this.currentUser.loadAttestationDetails();
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

    this.locale.setLocale(DEFAULT_LOCALE);
  }

  _getRouteAfterInvalidation() {
    const alternativeRootURL = this.alternativeRootURL;
    this.alternativeRootURL = null;

    return alternativeRootURL ? alternativeRootURL : this.url.homeUrl;
  }
}
