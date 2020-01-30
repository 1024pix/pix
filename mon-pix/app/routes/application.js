import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

import Route from '@ember/routing/route';

import { inject as service } from '@ember/service';

export default Route.extend(ApplicationRouteMixin, {

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

  // XXX: For override the sessionInvalidated from ApplicationRouteMixin to avoid the automatic redirection
  sessionInvalidated() {
    this.transitionTo('login');
  },

  _loadCurrentUser() {
    return this.get('currentUser').load().catch(() => this.get('session').invalidate());
  }

});
