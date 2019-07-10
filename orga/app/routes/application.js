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

  async sessionAuthenticated() {
    await this._loadInitialData();
    // Because ember-simple-auth does not support calling this._super() asynchronously,
    // we have to do this hack to call the original "sessionAuthenticated"
    const mixin = ApplicationRouteMixin.mixins[0];
    mixin.properties.sessionAuthenticated.call(this);
  },

  async _loadInitialData() {
    const user = await this._loadCurrentUser();

    return this._loadCurrentOrganization(user);
  },

  _loadCurrentUser() {
    return this.currentUser.load()
      .catch((error) => {
        this.session.invalidate();
        throw error;
      });
  },

  _loadCurrentOrganization(user) {
    return this.currentOrganization.load(user);
  }
});
