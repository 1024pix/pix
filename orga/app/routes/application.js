import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Route.extend(ApplicationRouteMixin, {

  routeAfterAuthentication: 'authenticated',
  currentUser: service(),
  currentOrganization: service(),

  beforeModel() {
    return this._loadInitialData();
  },

  sessionAuthenticated() {
    this._loadInitialData()
      .then(() => {
        // Because ember-simple-auth does not support calling this._super() asynchronously,
        // we have to do this hack to call the original "sessionAuthenticated"
        let mixin = ApplicationRouteMixin.mixins[0];
        mixin.properties.sessionAuthenticated.call(this);
      });
  },

  _loadInitialData() {
    return this._loadCurrentUser()
      .then((user) => this._loadCurrentOrganization(user));
  },

  _loadCurrentUser() {
    return this.get('currentUser').load()
      .catch((error) => {
        this.get('session').invalidate();
        throw error;
      });
  },

  _loadCurrentOrganization(user) {
    return this.get('currentOrganization').load(user);
  }
});
