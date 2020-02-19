import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Route.extend(ApplicationRouteMixin, {

  routeAfterAuthentication: 'authenticated',
  currentUser: service(),

  beforeModel() {
    return this._loadCurrentUser();
  },

  // The local variable _super is necessary, do not refactor it
  // https://github.com/simplabs/ember-simple-auth/blob/master/guides/managing-current-user.md#loading-the-current-user
  async sessionAuthenticated() {
    const _super = this._super;
    await this._loadCurrentUser();
    _super.call(this, ...arguments);
  },

  sessionInvalidated() {
    this.transitionTo('login');
  },

  _loadCurrentUser() {
    return this.get('currentUser')
      .load()
      .catch(() => this.get('session').invalidate());
  }
});
