import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default class ApplicationRoute extends Route.extend(ApplicationRouteMixin) {

  routeAfterAuthentication = 'authenticated';

  @service currentUser;
  @service url;

  beforeModel() {
    return this._loadCurrentUser();
  }

  async sessionAuthenticated() {
    await this._loadCurrentUser();
    this.transitionTo(this.routeAfterAuthentication);
  }

  sessionInvalidated() {
    const redirectionUrl = this._redirectionUrl();
    this._clearStateAndRedirect(redirectionUrl);
  }

  _redirectionUrl() {

    const alternativeRootURL = this.session.alternativeRootURL;
    this.session.alternativeRootURL = null;

    return alternativeRootURL ? alternativeRootURL : this.url.homeUrl;
  }

  _clearStateAndRedirect(url) {
    return window.location.replace(url);
  }

  _loadCurrentUser() {
    return this.currentUser.load();
  }
}
