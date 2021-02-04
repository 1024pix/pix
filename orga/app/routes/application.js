import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import get from 'lodash/get';
// eslint-disable-next-line ember/no-mixins
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

const DEFAULT_LOCALE = 'fr';

export default class ApplicationRoute extends Route.extend(ApplicationRouteMixin) {

  routeAfterAuthentication = 'authenticated';

  @service currentUser;
  @service url;
  @service intl;
  @service moment;

  beforeModel(transition) {
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
    await this._updatePrescriberLocale(lang);
    this._setLocale();
  }

  _updatePrescriberLocale(lang) {
    const prescriber = this.currentUser.prescriber;
    if (!prescriber || !lang) return;
    if (prescriber.lang === lang) return;

    prescriber.lang = lang;
    return prescriber.save({ adapterOptions: { lang } });
  }

  _setLocale() {
    const locale = get(this.currentUser, 'prescriber.lang', DEFAULT_LOCALE);
    this.intl.setLocale([locale, DEFAULT_LOCALE]);
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
