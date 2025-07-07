import { service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';

import Oauth2Code from '../authenticators/oauth2-code';

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
    const routeAfterInvalidation = this._getRouteAfterInvalidation();
    const encodedRedirectUri = encodeURIComponent(`${window.location.origin}${routeAfterInvalidation}`);
    const authorizationUri = await Oauth2Code.buildAuthorizationUri(encodedRedirectUri);
    return super.handleInvalidation(authorizationUri);
  }

  _getRouteAfterInvalidation() {
    const alternativeRootURL = this.alternativeRootURL;
    this.alternativeRootURL = null;

    return alternativeRootURL ? alternativeRootURL : this.url.homeUrl;
  }
}
