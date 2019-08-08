import { inject as service } from '@ember/service';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import Route from '@ember/routing/route';

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
        'authenticator:simple', { token: transition.to.queryParams.token }
      );
    }
  },

  async beforeModel(transition) {
    await this._checkForURLAuthentication(transition);
    return this._loadCurrentUser();
  },

  async sessionAuthenticated() {
    await this._loadCurrentUser();

    // Because ember-simple-auth does not support calling this._super() asynchronously,
    // we have to do this hack to call the original "sessionAuthenticated"
    ApplicationRouteMixin.mixins[0].properties.sessionAuthenticated.call(this);
  },

  // XXX: For override the sessionInvalidated from ApplicationRouteMixin to avoid the automatic redirection
  sessionInvalidated() {},

  _loadCurrentUser() {
    return this.currentUser.load();
  }
});
