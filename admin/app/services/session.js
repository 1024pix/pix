import { service } from '@ember/service';
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

  async handleInvalidation() {
    // todo(auth)
    const routeAfterInvalidation = this._getRouteAfterInvalidation();
    const encodedRedirectUri = encodeURIComponent(`${window.location.origin}${routeAfterInvalidation}`);
    const authRoute = `http://localhost:4206?redirect_uri=${encodedRedirectUri}`;
    return super.handleInvalidation(authRoute);
  }

  _getRouteAfterInvalidation() {
    const alternativeRootURL = this.alternativeRootURL;
    this.alternativeRootURL = null;

    return alternativeRootURL ? alternativeRootURL : this.url.homeUrl;
  }
}
