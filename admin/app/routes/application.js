import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ApplicationRoute extends Route {

  @service currentUser;
  @service featureToggles;
  @service notifications;
  @service session;
  @service url;

  constructor() {
    super(...arguments);
    this.session.on('invalidationSucceeded', () => this._handleInvalidation());
  }

  async beforeModel() {
    await this.featureToggles.load();
    return this._loadCurrentUser();
  }

  _handleInvalidation() {
    const routeAfterInvalidation = this._getRouteAfterInvalidation();
    this.session.handleInvalidation(routeAfterInvalidation);
  }

  _loadCurrentUser() {
    return this.currentUser.load();
  }

  _getRouteAfterInvalidation() {
    const alternativeRootURL = this.session.alternativeRootURL;
    this.session.alternativeRootURL = null;

    return alternativeRootURL ? alternativeRootURL : this.url.homeUrl;
  }
}
