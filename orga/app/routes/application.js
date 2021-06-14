import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import get from 'lodash/get';
// eslint-disable-next-line ember/no-mixins
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

const DEFAULT_FRENCH_LOCALE = 'fr';

export default class ApplicationRoute extends Route.extend(ApplicationRouteMixin) {

  routeAfterAuthentication = 'authenticated';

  //@service currentDomain;
  @service currentUser;
  @service featureToggles;
  @service intl;
  @service moment;
  @service url;

  async beforeModel(transition) {
    await this.featureToggles.load();
    const lang = transition.to.queryParams.lang;
    return this._getUserAndLocale(lang);
  }

  async sessionAuthenticated() {
    await this._getUserAndLocale();
    this.transitionTo(this.routeAfterAuthentication);
  }

  sessionInvalidated() {
    const redirectionUrl = this._redirectionUrl();
    this._clearStateAndRedirect(redirectionUrl);
  }

  async _getUserAndLocale(lang = null) {
    await this._loadCurrentUser();
    await this._updatePrescriberLanguage(lang);
    this._setLocale(lang);
  }

  async _updatePrescriberLanguage(lang) {
    const prescriber = this.currentUser.prescriber;
    if (!prescriber || !lang) return;
    if (prescriber.lang === lang) return;

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
      locale = this.intl.get('locales').includes(lang)
        ? lang
        : DEFAULT_FRENCH_LOCALE;
    }

    this.intl.setLocale([locale, DEFAULT_FRENCH_LOCALE]);
    this.moment.setLocale(locale);
  }

  _redirectionUrl() {
    const alternativeRootURL = this.session.alternativeRootURL;
    this.session.alternativeRootURL = null;

    return alternativeRootURL ? alternativeRootURL : this.url.homeUrl;
  }

  _clearStateAndRedirect(url) {
    return window.location.replace(url);
  }

  _loadCurrentUser() {
    return this.currentUser.load();
  }
}
