import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Route.extend(ApplicationRouteMixin, {

  routeAfterAuthentication: 'authenticated',
  currentUser: service(),
  currentCertificationCenter: service(),

  beforeModel() {
    return this._loadInitialData();
  },

  sessionAuthenticated() {
    return this._loadInitialData()
      .then(() => {
        // Because ember-simple-auth does not support calling this._super() asynchronously,
        // we have to do this hack to call the original "sessionAuthenticated"
        const mixin = ApplicationRouteMixin.mixins[0];
        mixin.properties.sessionAuthenticated.call(this);
      });
  },

  _loadInitialData() {
    return this._loadCurrentUser()
      .then((user) => this._loadCurrentCertificationCenter(user));
  },

  _loadCurrentUser() {
    return this.currentUser.load()
      .catch((error) => {
        this.session.invalidate();
        throw error;
      });
  },

  _loadCurrentCertificationCenter(user) {
    return this.currentCertificationCenter.load(user);
  }

});
