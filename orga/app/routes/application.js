import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default class ApplicationRoute extends Route.extend(ApplicationRouteMixin) {
  routeAfterAuthentication = 'authenticated';

  @service currentUser;

  beforeModel() {
    return this._loadCurrentUser();
  }

  async sessionAuthenticated() {
    await this._loadCurrentUser();
    this.transitionTo(this.routeAfterAuthentication);
  }

  sessionInvalidated() {
    this.transitionTo('login');
  }

  _loadCurrentUser() {
    return this.currentUser.load();
  }
}
