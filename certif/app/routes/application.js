import Route from '@ember/routing/route';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

import { inject as service } from '@ember/service';

export default Route.extend(ApplicationRouteMixin, {
  routeAfterAuthentication: 'authenticated',
  currentUser: service(),

  beforeModel() {
    return this._loadCurrentUser();
  },

  async sessionAuthenticated() {
    await this._loadCurrentUser();
    this.transitionTo(this.routeAfterAuthentication);
  },

  sessionInvalidated() {
    this.transitionTo('login');
  },

  _loadCurrentUser() {
    return this.currentUser.load();
  },
});
