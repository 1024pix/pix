import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

import Route from '@ember/routing/route';

import { inject as service } from '@ember/service';

export default Route.extend(ApplicationRouteMixin, {

  routeAfterAuthentication: 'authenticated',
  splash: service(),
  currentUser: service(),
  session: service(),

  activate() {
    this.splash.hide();
  },

  _checkForURLAuthentication(transition) {
    if (transition.to.queryParams && transition.to.queryParams.token) {
      return this.session.authenticate(
        'authenticator:oauth2', { token: transition.to.queryParams.token }
      );
    }
  },

  async beforeModel(transition) {
    await this._checkForURLAuthentication(transition);
    return this._loadCurrentUser();
  },

  async sessionAuthenticated() {
    const _super = this._super;
    await this._loadCurrentUser();
    _super.call(this, ...arguments);
  },

  // We need to override the sessionInvalidated from ApplicationRouteMixin
  // to avoid the automatic redirection to login
  // when coming from the GAR authentication
  // https://github.com/simplabs/ember-simple-auth/blob/a3d51d65b7d8e3a2e069c0af24aca2e12c7c3a95/addon/mixins/application-route-mixin.js#L132
  sessionInvalidated() {},

  _loadCurrentUser() {
    return this.currentUser.load().catch(() => this.session.invalidate());
  }

});
