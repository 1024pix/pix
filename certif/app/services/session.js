import { inject as service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';

export default class CurrentSessionService extends SessionService {

  @service currentUser;
  @service router;
  @service url;

  routeAfterAuthentication = 'authenticated';

  async handleAuthentication() {
    await this.currentUser.load();
    super.handleAuthentication(this.routeAfterAuthentication);
  }

  handleInvalidation() {
    const routeAfterInvalidation = this._getRouteAfterInvalidation();
    super.handleInvalidation(routeAfterInvalidation);
  }

  _getRouteAfterInvalidation() {
    const alternativeRootURL = this.alternativeRootURL;
    this.alternativeRootURL = null;

    return alternativeRootURL ? alternativeRootURL : this.url.homeUrl;
  }
}
