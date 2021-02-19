/* eslint ember/no-classic-classes: 0 */

import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

import Route from '@ember/routing/route';

import { inject as service } from '@ember/service';
import get from 'lodash/get';

export default Route.extend(ApplicationRouteMixin, {

  splash: service(),
  currentUser: service(),
  session: service(),
  intl: service(),
  moment: service(),
  headData: service(),
  featureToggles: service(),

  activate() {
    this.splash.hide();
  },

  async _checkForURLAuthentication(transition) {

    if (transition.to.queryParams && transition.to.queryParams.externalUser) {
      // Logout user when a new external user is authenticated.
      await this._logoutUser();
    }

    if (transition.to.queryParams && transition.to.queryParams.token) {
      // Logout user when existing external user is authenticated.
      await this._logoutUser();
      return this.session.authenticate(
        'authenticator:oauth2', { token: transition.to.queryParams.token },
      );
    }
  },

  async beforeModel(transition) {
    this.headData.description = this.intl.t('application.description');
    await this._checkForURLAuthentication(transition);

    await this.featureToggles.load().catch();

    const locale = transition.to.queryParams.lang;

    await this._loadCurrentUser();
    await this._handleLanguage(locale);
  },

  async sessionAuthenticated() {
    const _super = this._super;

    await this._loadCurrentUser();
    await this._handleLanguage();

    const nextURL = this.session.data.nextURL;
    if (nextURL && get(this.session, 'data.authenticated.source') === 'pole_emploi_connect') {
      this.session.set('data.nextURL', undefined);
      this.replaceWith(nextURL);
    } else {
      _super.call(this, ...arguments);
    }
  },

  // We need to override the sessionInvalidated from ApplicationRouteMixin
  // to avoid the automatic redirection to login
  // when coming from the GAR authentication
  // https://github.com/simplabs/ember-simple-auth/blob/a3d51d65b7d8e3a2e069c0af24aca2e12c7c3a95/addon/mixins/application-route-mixin.js#L132
  sessionInvalidated() {},

  async _handleLanguage(locale = null) {

    const defaultLocale = 'fr';

    if (locale && this.currentUser.user) {
      this.currentUser.user.lang = locale;
      await this.currentUser.user.save({ adapterOptions: { lang: locale } });
      await this._setLocale(this.currentUser.user.lang, defaultLocale);
    } else if (this.currentUser.user) {
      await this._setLocale(this.currentUser.user.lang, defaultLocale);
    } else {
      await this._setLocale(locale, defaultLocale);
    }
  },

  _setLocale(locale, defaultLocale) {
    this.intl.setLocale([locale, defaultLocale]);
    this.moment.setLocale(locale);
  },

  _loadCurrentUser() {
    return this.currentUser.load()
      .catch(() => this.session.invalidate());
  },

  _logoutUser() {
    delete this.session.data.expectedUserId;
    delete this.session.data.externalUser;
    return this.session.invalidate();
  },
});
