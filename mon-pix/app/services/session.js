import { inject as service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';
import get from 'lodash/get';

export default class CurrentSessionService extends SessionService {

  @service currentUser;
  @service currentDomain;
  @service intl;
  @service moment;
  @service url;
  @service router;

  routeAfterAuthentication = 'user-dashboard';

  async handleAuthentication() {
    await this._loadCurrentUserAndSetLocale();

    const nextURL = this.data.nextURL;
    if (nextURL && get(this.data, 'authenticated.source') === 'pole_emploi_connect') {
      this.data.nextURL = undefined;
      return this.router.replaceWith(nextURL);
    }

    //redirect when necessary ???
    super.handleAuthentication(this.routeAfterAuthentication);
  }

  handleInvalidation() {
    const routeAfterInvalidation = this._getRouteAfterInvalidation();
    super.handleInvalidation(routeAfterInvalidation);
  }

  async handleUserLanguageAndLocale(transition = null) {
    await this._checkForURLAuthentication(transition);
    await this._checkAnonymousAccess(transition);

    const locale = transition.to.queryParams.lang;
    await this._loadCurrentUserAndSetLocale(locale);
  }

  requireAuthenticationAndApprovedTermsOfService(transition) {
    if (this.isAuthenticated && this.currentUser.user.mustValidateTermsOfService) {
      this.attemptedTransition = transition;
      this.router.transitionTo('terms-of-service');
    }
    super.requireAuthentication(transition, 'login');
  }

  async _checkForURLAuthentication(transition) {
    if (transition.to.queryParams && transition.to.queryParams.externalUser) {
      // Logout user when a new external user is authenticated.
      await this._logoutUser();
    }

    if (transition.to.queryParams && transition.to.queryParams.token) {
      // Logout user when existing external user is authenticated.
      await this._logoutUser(false);
      return super.authenticate(
        'authenticator:oauth2', { token: transition.to.queryParams.token },
      );
    }
  }

  async _checkAnonymousAccess(transition) {
    const allowedRoutesForAnonymousAccess = ['fill-in-campaign-code', 'campaigns.assessment.tutorial', 'campaigns.start-or-resume', 'campaigns.entry-point', 'campaigns.campaign-not-found', 'campaigns.campaign-landing-page', 'assessments.challenge', 'campaigns.assessment.skill-review', 'assessments.checkpoint'];
    const isUserAnonymous = get(this, 'data.authenticated.authenticator') === 'authenticator:anonymous';
    const isRouteAccessNotAllowedForAnonymousUser = !allowedRoutesForAnonymousAccess.includes(get(transition, 'to.name'));

    if (isUserAnonymous && isRouteAccessNotAllowedForAnonymousUser) {
      await this._logoutUser();
      this.router.replaceWith('/campagnes');
    }
  }

  async _loadCurrentUserAndSetLocale(locale = null) {
    await this.currentUser.load();
    await this._handleLocale(locale);
  }

  async _handleLocale(localeFromQueryParam = null) {
    const isUserLoaded = !!this.currentUser.user;
    const domain = this.currentDomain.getExtension();
    const defaultLocale = 'fr';

    if (domain === 'fr') {
      await this._setLocale(defaultLocale);
      return;
    }

    if (isUserLoaded) {
      if (localeFromQueryParam) {
        this.currentUser.user.lang = localeFromQueryParam;
        try {
          await this.currentUser.user.save({ adapterOptions: { lang: this.currentUser.user.lang } });
          await this._setLocale(this.currentUser.user.lang);
        } catch (error) {
          const status = get(error, 'errors[0].status');
          if (status === '400') {
            this.currentUser.user.rollbackAttributes();
            await this._setLocale(this.currentUser.user.lang);
          } else {
            throw error;
          }
        }
      } else {
        await this._setLocale(this.currentUser.user.lang);
      }
    } else {
      if (localeFromQueryParam) {
        await this._setLocale(localeFromQueryParam);
      } else {
        await this._setLocale(defaultLocale);
      }

    }
  }

  _setLocale(locale) {
    const defaultLocale = 'fr';
    this.intl.setLocale([locale, defaultLocale]);
    this.moment.setLocale(locale);
  }

  _getRouteAfterInvalidation() {
    const alternativeRootURL = this.alternativeRootURL;
    this.alternativeRootURL = null;

    return alternativeRootURL ? alternativeRootURL : this.url.homeUrl;
  }

  _logoutUser(keepSession) {
    delete super.data.expectedUserId;
    delete super.data.externalUser;
    return keepSession ? Promise.resolve() : super.invalidate();
  }
}
